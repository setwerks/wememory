import { supabase } from './supabase'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email?: string
  walletAddress?: string
}

export interface EmailPasswordCredentials {
  email: string
  password: string
}

export interface WalletCredentials {
  walletAddress: string
  signature?: string
}

export type AuthCredentials = EmailPasswordCredentials | WalletCredentials

export async function signIn(credentials: AuthCredentials): Promise<AuthUser> {
  if ('email' in credentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })
    if (error) throw error
    if (!data.user) throw new Error('User not found')
    return { id: data.user.id, email: data.user.email }
  } else {
    // Wallet-based auth (to be implemented)
    throw new Error('Wallet-based auth not implemented yet')
  }
}

export async function signUp(credentials: AuthCredentials): Promise<AuthUser> {
  if ('email' in credentials) {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password
    })
    if (error) throw error
    if (!data.user) throw new Error('User not found')
    return { id: data.user.id, email: data.user.email }
  } else {
    // Wallet-based signup (to be implemented)
    throw new Error('Wallet-based signup not implemented yet')
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return { id: data.user.id, email: data.user.email }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    supabase.auth.getUser().then(({ data, error }) => {
      if (mounted) {
        setUser(data?.user ?? null)
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      mounted = false
      listener?.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
  }

  return { user, loading, signOut }
} 