import { useEffect, useState } from 'react'
import { supabase } from '@wememory/lib'
import type { EventThread } from '@wememory/types'

interface UseEventThreadsOptions {
  userId?: string | null
  location?: {
    latitude: number
    longitude: number
    radiusInKm: number
  }
}

export function useEventThreads(options: UseEventThreadsOptions = {}) {
  const [events, setEvents] = useState<EventThread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    const fetchEvents = async () => {
      let query = supabase
        .from('event_threads')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(100)

      if (options.userId) {
        query = query.or(`visibility.eq.public,created_by.eq.${options.userId}`)
      } else {
        query = query.eq('visibility', 'public')
      }

      if (options.location) {
        const { latitude, longitude, radiusInKm } = options.location
        query = query.rpc('events_within_radius', {
          lat: latitude,
          lng: longitude,
          radius_km: radiusInKm
        })
      }

      const { data, error } = await query
      if (isMounted) {
        if (error) setError(error)
        else setEvents(data as EventThread[])
        setLoading(false)
      }
    }

    fetchEvents()
    return () => {
      isMounted = false
    }
  }, [options.userId, options.location])

  return { events, loading, error }
} 