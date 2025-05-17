import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@wememory/lib'
import { Memory, EventThread } from '@wememory/types'
import { format } from 'date-fns'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function EventPage() {
  const router = useRouter()
  const { id } = router.query

  const { data: event, isLoading: eventLoading } = useQuery<EventThread>({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_threads')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id
  })

  const { data: memories, isLoading: memoriesLoading } = useQuery<Memory[]>({
    queryKey: ['memories', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('event_id', id)
        .eq('visibility', 'public')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!id
  })

  if (eventLoading || memoriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text">Event not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Event Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text mb-2">{event.title}</h1>
        <p className="text-text/80 mb-4">{event.description}</p>
        <div className="flex gap-2 mb-8">
          {event.tags?.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-sm"
              style={{ background: 'rgba(255,153,0,0.1)', color: '#FF9900' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

          {/* Memories */}
          {memories?.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative mb-8"
            >
              {/* Timeline dot */}
              <div className="absolute left-4 top-6 w-3 h-3 rounded-full" style={{ background: '#FF9900' }}></div>

              {/* Memory content */}
              <div className="ml-12 bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {memory.thumbnail_url && (
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={memory.thumbnail_url}
                        alt={memory.title}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {memory.title}
                    </h3>
                    <p className="text-text/80 mb-4">{memory.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {memory.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-sm"
                          style={{ background: 'rgba(255,153,0,0.1)', color: '#FF9900' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Timestamp */}
                    <div className="mt-4 text-sm text-text/60">
                      {format(new Date(memory.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {memories?.length === 0 && (
            <div className="text-center text-text/60 py-8">
              No memories shared yet. Be the first to share a memory!
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 