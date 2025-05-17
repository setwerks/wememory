-- ✅ Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ✅ USERS (managed by Supabase Auth)
-- Supabase provides a `auth.users` table linked to sessions
-- We'll use references to auth.uid() where needed

-- ✅ EVENT THREADS
create table public.event_threads (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location geography, -- Using PostGIS for location data
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  tags text[] default '{}', -- Array of tags for event categorization
  created_by uuid references auth.users(id),
  visibility text check (visibility in ('public', 'group', 'private')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  status text check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')) default 'upcoming',
  max_participants integer, -- Optional limit on participants
  current_participants integer default 0,
  cover_image_url text, -- URL to the event's cover image
  metadata jsonb default '{}'::jsonb -- Flexible field for additional data
);

create index on event_threads using gist(location);

-- ✅ MEMORIES
create table public.memories (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.event_threads(id),
  user_id uuid references auth.users(id),
  content text,
  media_urls text[] default '{}', -- Array of media file URLs
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  emotion_tags text[] default '{}', -- Array of emotion tags
  visibility text check (visibility in ('public', 'group', 'private')),
  location geography, -- Where the memory was created
  likes_count integer default 0,
  comments_count integer default 0,
  metadata jsonb default '{}'::jsonb -- Flexible field for additional data
);

create index on memories using gist(location);

-- ✅ MEMORY REACTIONS (Optional)
create table public.memory_reactions (
  id uuid primary key default uuid_generate_v4(),
  memory_id uuid references memories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  reaction text check (reaction in ('❤️', '😭', '🔥', '👏', '🤯')),
  created_at timestamp with time zone default now(),
  unique (memory_id, user_id)
);

-- ✅ GROUPS (optional future extension)
create table public.user_groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references user_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin', 'member')) default 'member',
  unique (group_id, user_id)
);

-- ✅ RLS POLICIES

-- EVENT THREADS
alter table event_threads enable row level security;

create policy "Users can view public events"
  on public.event_threads for select
  using (visibility = 'public');

create policy "Users can view their own events"
  on public.event_threads for select
  using (auth.uid() = created_by);

create policy "Users can create events"
  on public.event_threads for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own events"
  on public.event_threads for update
  using (auth.uid() = created_by);

create policy "Users can delete their own events"
  on public.event_threads for delete
  using (auth.uid() = created_by);

-- MEMORIES
alter table memories enable row level security;

create policy "Users can view public memories"
  on public.memories for select
  using (visibility = 'public');

create policy "Users can view their own memories"
  on public.memories for select
  using (auth.uid() = user_id);

create policy "Users can create memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own memories"
  on public.memories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own memories"
  on public.memories for delete
  using (auth.uid() = user_id);

-- REACTIONS
alter table memory_reactions enable row level security;

create policy "Insert own reaction"
  on memory_reactions
  for insert
  with check (auth.uid() = user_id);

create policy "Select reactions"
  on memory_reactions
  for select
  using (true);

create policy "Delete own reaction"
  on memory_reactions
  for delete
  using (auth.uid() = user_id);

-- GROUPS (Optional)
alter table user_groups enable row level security;
alter table group_members enable row level security;

create policy "View owned or joined groups"
  on user_groups
  for select
  using (
    created_by = auth.uid()
    OR id IN (select group_id from group_members where user_id = auth.uid())
  );

create policy "Insert own group"
  on user_groups
  for insert
  with check (auth.uid() = created_by);

create policy "Update own group"
  on user_groups
  for update
  using (auth.uid() = created_by);

create policy "Delete own group"
  on user_groups
  for delete
  using (auth.uid() = created_by);

create policy "Insert group member"
  on group_members
  for insert
  with check (auth.uid() = (select created_by from user_groups where id = group_id));

create policy "View group members"
  on group_members
  for select
  using (true);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger set_updated_at
  before update on public.event_threads
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.memories
  for each row
  execute function public.handle_updated_at();

-- Create memory_comments table for nested comments
create table public.memory_comments (
  id uuid default gen_random_uuid() primary key,
  memory_id uuid references public.memories(id) on delete cascade,
  user_id uuid references auth.users(id),
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  parent_id uuid references public.memory_comments(id), -- For nested comments
  likes_count integer default 0
);

-- Create event_participants table
create table public.event_participants (
  event_id uuid references public.event_threads(id) on delete cascade,
  user_id uuid references auth.users(id),
  role text check (role in ('organizer', 'participant', 'invited')) default 'participant',
  status text check (status in ('confirmed', 'pending', 'declined')) default 'pending',
  joined_at timestamp with time zone default now(),
  primary key (event_id, user_id)
);

-- Create indexes for better query performance
-- Event threads indexes
create index idx_event_threads_created_by on public.event_threads(created_by);
create index idx_event_threads_visibility on public.event_threads(visibility);
create index idx_event_threads_dates on public.event_threads(start_date, end_date);
create index idx_event_threads_status on public.event_threads(status);

-- Memories indexes
create index idx_memories_event_id on public.memories(event_id);
create index idx_memories_user_id on public.memories(user_id);
create index idx_memories_created_at on public.memories(created_at);
create index idx_memories_visibility on public.memories(visibility);

-- Comments indexes
create index idx_memory_comments_memory_id on public.memory_comments(memory_id);
create index idx_memory_comments_user_id on public.memory_comments(user_id);
create index idx_memory_comments_parent_id on public.memory_comments(parent_id);

-- Event participants indexes
create index idx_event_participants_event_id on public.event_participants(event_id);
create index idx_event_participants_user_id on public.event_participants(user_id);
create index idx_event_participants_status on public.event_participants(status);

-- Enable Row Level Security
alter table public.memory_comments enable row level security;
alter table public.event_participants enable row level security;

-- RLS Policies for memory_comments
create policy "Users can view comments on public memories"
  on public.memory_comments for select
  using (
    exists (
      select 1 from public.memories
      where id = memory_comments.memory_id
      and (visibility = 'public' or user_id = auth.uid())
    )
  );

create policy "Users can create comments"
  on public.memory_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.memory_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.memory_comments for delete
  using (auth.uid() = user_id);

-- RLS Policies for event_participants
create policy "Users can view participants of public events"
  on public.event_participants for select
  using (
    exists (
      select 1 from public.event_threads
      where id = event_participants.event_id
      and (visibility = 'public' or created_by = auth.uid())
    )
  );

create policy "Users can join events"
  on public.event_participants for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own participation"
  on public.event_participants for update
  using (auth.uid() = user_id);

create policy "Users can leave events"
  on public.event_participants for delete
  using (auth.uid() = user_id);

-- Create function to update participant count
create or replace function public.update_event_participant_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.event_threads
    set current_participants = current_participants + 1
    where id = NEW.event_id;
  elsif TG_OP = 'DELETE' then
    update public.event_threads
    set current_participants = current_participants - 1
    where id = OLD.event_id;
  end if;
  return null;
end;
$$ language plpgsql;

-- Create trigger for participant count
create trigger update_participant_count
  after insert or delete on public.event_participants
  for each row
  execute function public.update_event_participant_count();

-- Function to filter events within a radius
CREATE OR REPLACE FUNCTION events_within_radius(lat double precision, lng double precision, radius_km double precision)
RETURNS SETOF event_threads AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM event_threads
  WHERE ST_DWithin(
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    radius_km * 1000
  );
END;
$$ LANGUAGE plpgsql;

