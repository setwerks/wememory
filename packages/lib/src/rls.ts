import { supabase } from './supabase'
import { Memory, EventThread } from '@wememory/types'

export async function getMemories(eventId: string): Promise<Memory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('event_id', eventId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getEvent(eventId: string): Promise<EventThread | null> {
  const { data, error } = await supabase
    .from('event_threads')
    .select('*')
    .eq('id', eventId)
    .single()
  if (error) throw error
  return data
}

export async function canAccessMemory(memoryId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('memories')
    .select('visibility, user_id')
    .eq('id', memoryId)
    .single()
  if (error) throw error
  if (!data) return false
  return data.visibility === 'public' || data.user_id === userId
}

export async function canAccessEvent(eventId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('event_threads')
    .select('visibility, created_by')
    .eq('id', eventId)
    .single()
  if (error) throw error
  if (!data) return false
  return data.visibility === 'public' || data.created_by === userId
} 