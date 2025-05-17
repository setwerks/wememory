import { useEffect, useState } from 'react'
import { useAuth, getMemories } from '@wememory/lib'
import type { Memory } from '@wememory/types'
import { useRouter } from 'next/router'

export default function Home() {
  const { user } = useAuth()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadMemories() {
      try {
        // For now, we'll use a hardcoded event ID
        // TODO: Add event selection or use the user's default event
        const eventId = 'default-event'
        const data = await getMemories(eventId)
        setMemories(data)
      } catch (error) {
        console.error('Failed to load memories:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadMemories()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-text/80">Loading memories...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold" style={{ color: '#FF9900' }}>
            My Memories
          </h1>
          <button
            className="btn-primary"
            onClick={() => router.push('/create-event')}
          >
            Create Memory
          </button>
        </div>
        
        {memories.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-xl text-text/80 mb-4">No memories yet</p>
            <p className="text-text/60">Create your first memory to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <div key={memory.id} className="card group hover:scale-[1.02] transition-transform">
                {memory.media_urls?.[0] && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={memory.media_urls[0]}
                      alt={memory.content || ''}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-sm text-text/60 mb-2">
                    {memory.created_at ? new Date(memory.created_at).toLocaleDateString() : ''}
                  </p>
                  <p className="text-lg mb-4 line-clamp-3">{memory.content}</p>
                  {memory.emotion_tags && memory.emotion_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {memory.emotion_tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 