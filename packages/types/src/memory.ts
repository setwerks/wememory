import { Database } from './database.types'

// Base types from Supabase schema
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Event Thread Types
export type EventThread = Tables['event_threads']['Row']
export type EventThreadInsert = Tables['event_threads']['Insert']
export type EventThreadUpdate = Tables['event_threads']['Update']

// Memory Types
export type Memory = Tables['memories']['Row']
export type MemoryInsert = Tables['memories']['Insert']
export type MemoryUpdate = Tables['memories']['Update']

// Comment Types
export type MemoryComment = Tables['memory_comments']['Row']
export type MemoryCommentInsert = Tables['memory_comments']['Insert']
export type MemoryCommentUpdate = Tables['memory_comments']['Update']

// Event Participant Types
export type EventParticipant = Tables['event_participants']['Row']
export type EventParticipantInsert = Tables['event_participants']['Insert']
export type EventParticipantUpdate = Tables['event_participants']['Update']

// Enums and Constants
export type Visibility = 'public' | 'group' | 'private'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type ParticipantRole = 'organizer' | 'participant' | 'invited'
export type ParticipantStatus = 'confirmed' | 'pending' | 'declined'

// Emotion Tags
export type EmotionTag = 
  | 'joy' 
  | 'love' 
  | 'awe' 
  | 'grief' 
  | 'anger' 
  | 'fear' 
  | 'surprise' 
  | 'disgust' 
  | 'pride' 
  | 'shame' 
  | 'gratitude' 
  | 'hope' 
  | 'nostalgia'

// Location type
export interface Location {
  lat: number
  lng: number
}

// Helper type for creating a new event
export interface CreateEventInput {
  title: string
  description?: string
  location?: Location
  startDate: Date
  endDate?: Date
  tags?: string[]
  visibility: Visibility
  maxParticipants?: number
  coverImageUrl?: string
  metadata?: Record<string, unknown>
}

// Helper type for creating a new memory
export interface CreateMemoryInput {
  eventId?: string
  content: string
  mediaUrls?: string[]
  emotionTags?: EmotionTag[]
  visibility: Visibility
  location?: Location
  metadata?: Record<string, unknown>
}

// Helper type for creating a new comment
export interface CreateCommentInput {
  memoryId: string
  content: string
  parentId?: string
}

// Helper type for event participation
export interface EventParticipationInput {
  eventId: string
  role?: ParticipantRole
  status?: ParticipantStatus
}

// Type for event search filters
export interface EventSearchFilters {
  visibility?: Visibility
  status?: EventStatus
  startDate?: Date
  endDate?: Date
  tags?: string[]
  location?: Location
  radius?: number // in meters
  createdBy?: string
}

// Type for memory search filters
export interface MemorySearchFilters {
  eventId?: string
  userId?: string
  visibility?: Visibility
  emotionTags?: EmotionTag[]
  startDate?: Date
  endDate?: Date
  location?: Location
  radius?: number // in meters
} 