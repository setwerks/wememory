import React from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuth } from '@wememory/lib'
import { useEffect } from 'react'

export default function RootLayout() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (!loading) {
      const inAuthGroup = segments[0] === 'auth'
      if (!user && !inAuthGroup) {
        router.replace('/auth')
      }
      if (user && inAuthGroup) {
        router.replace('/')
      }
    }
  }, [user, loading, segments, router])

  if (loading) {
    return null
  }

  return <Stack />
} 