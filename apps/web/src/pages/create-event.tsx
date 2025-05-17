import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@wememory/lib'
import { EventThread } from '@wememory/types'
import styles from './create-event.module.css'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('event_threads')
        .insert([
          {
            title,
            description,
            tags,
            start_date: startDate,
            end_date: endDate,
            location: `POINT(${location.longitude} ${location.latitude})`,
            visibility: 'public',
            created_by: supabase.auth.user()?.id
          }
        ])
        .select()

      if (error) throw error
      navigate('/events')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Event</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={styles.textarea}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            value={tags.join(',')}
            onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location">Location (latitude, longitude)</label>
          <input
            id="location"
            type="text"
            value={`${location.latitude}, ${location.longitude}`}
            onChange={(e) => {
              const [lat, lng] = e.target.value.split(',').map(coord => parseFloat(coord.trim()))
              setLocation({ latitude: lat, longitude: lng })
            }}
            required
            className={styles.input}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  )
} 