import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@wememory/lib'
import { signIn, signUp } from '@wememory/lib'

export default function Auth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isLogin) {
        await signIn({ email, password })
        setSuccess('Logged in successfully!')
      } else {
        await signUp({ email, password })
        setSuccess('Account created successfully!')
      }
      // Redirect or update UI as needed
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950">
      <div className="w-full max-w-md p-8 bg-card dark:bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-text dark:text-white mb-6">
          {isLogin ? 'Login' : 'Sign Up'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text dark:text-gray-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background dark:bg-gray-950 border border-border dark:border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:focus:ring-wememory.primary dark:focus:border-wememory.primary text-text dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text dark:text-gray-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background dark:bg-gray-950 border border-border dark:border-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:focus:ring-wememory.primary dark:focus:border-wememory.primary text-text dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-2 bg-error/10 dark:bg-red-900/30 text-error dark:text-red-400 rounded-md text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-2 bg-success/10 dark:bg-green-900/30 text-success dark:text-green-400 rounded-md text-sm text-center">
            {success}
          </div>
        )}
        <div className="mt-4 text-center">
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent font-semibold cursor-pointer hover:underline transition"
            role="button"
            tabIndex={0}
            style={{ outline: 'none' }}
            onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setIsLogin(!isLogin) }}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </span>
        </div>
      </div>
    </div>
  )
} 