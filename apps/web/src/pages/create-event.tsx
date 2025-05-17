import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, useAuth } from '@wememory/lib'
import { EventThread } from '@wememory/types'
// @ts-ignore
import dynamic from 'next/dynamic'

// @ts-ignore
const PlacesAutocomplete = dynamic(() => import('react-places-autocomplete'), { ssr: false })

// @ts-ignore
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'

// @ts-ignore-next-line
// eslint-disable-next-line
// If you want, you can create a file 'react-places-autocomplete.d.ts' with 'declare module "react-places-autocomplete";'

export default function CreateEvent() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Location autocomplete state
  const [address, setAddress] = useState('')
  const [locationDetails, setLocationDetails] = useState<{
    city: string
    state: string
    lat: number | null
    lng: number | null
  }>({ city: '', state: '', lat: null, lng: null })

  const handleSelect = async (value: string) => {
    setAddress(value)
    const results = await geocodeByAddress(value)
    const latLng = await getLatLng(results[0])
    // Extract city and state from address_components
    let city = ''
    let state = ''
    const components = results[0]?.address_components || []
    for (const comp of components) {
      if (comp.types.includes('locality')) city = comp.long_name
      if (comp.types.includes('administrative_area_level_1')) state = comp.long_name
    }
    setLocationDetails({
      city,
      state,
      lat: latLng.lat,
      lng: latLng.lng
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!user) {
      setError('You must be logged in to create an event')
      setLoading(false)
      return
    }

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
            address,
            city: locationDetails.city,
            state: locationDetails.state,
            latitude: locationDetails.lat,
            longitude: locationDetails.lng,
            visibility: 'public',
            user_id: user.id
          }
        ])
        .select()

      if (error) throw error
      router.push('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-xl p-6">
      <h1 className="text-3xl font-bold mb-4">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl shadow">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input w-full text-gray-900"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="input w-full min-h-[100px] text-gray-900"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            value={tags.join(',')}
            onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
            className="input w-full text-gray-900"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
          <PlacesAutocomplete
            value={address}
            onChange={setAddress}
            onSelect={handleSelect}
            searchOptions={{ types: ['(cities)'] }}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }: {
              getInputProps: any;
              suggestions: any[];
              getSuggestionItemProps: any;
              loading: boolean;
            }) => (
              <div className="relative">
                <input
                  {...getInputProps({
                    placeholder: 'Search for a city... ',
                    className: 'input w-full text-gray-900',
                  })}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-card border border-border rounded shadow mt-1">
                    {loading && <div className="p-2 text-sm text-gray-500">Loading...</div>}
                    {suggestions.map((suggestion: any) => (
                      <div
                        {...getSuggestionItemProps(suggestion, {
                          className:
                            'p-2 cursor-pointer hover:bg-primary/10 text-text',
                        })}
                        key={suggestion.placeId}
                      >
                        {suggestion.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </PlacesAutocomplete>
          {locationDetails.city && locationDetails.state && (
            <div className="mt-2 text-sm text-text/70">
              Selected: {locationDetails.city}, {locationDetails.state}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date</label>
          <input
            id="startDate"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="input w-full text-gray-900"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
          <input
            id="endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="input w-full text-gray-900"
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  )
} 