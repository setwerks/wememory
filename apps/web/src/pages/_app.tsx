import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useAuth } from '@wememory/lib'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && router.pathname !== '/auth') {
      router.replace('/auth')
    }
    if (!loading && user && router.pathname === '/auth') {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-text">Loading...</div>
  }

  return <Component {...pageProps} />
}

export default MyApp 