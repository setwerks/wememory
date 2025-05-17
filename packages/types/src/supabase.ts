import { Database } from './database.types'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

export type EventThread = Tables['event_threads']['Row']
export type EventThreadInsert = Tables['event_threads']['Insert']
export type EventThreadUpdate = Tables['event_threads']['Update']

export type Memory = Tables['memories']['Row']
export type MemoryInsert = Tables['memories']['Insert']
export type MemoryUpdate = Tables['memories']['Update']

export type Visibility = 'public' | 'group' | 'private' 