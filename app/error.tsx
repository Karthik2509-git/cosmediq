'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6">{error.message || 'An unexpected error occurred'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors">
            Try again
          </button>
          <Link href="/dashboard"
            className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm transition-colors">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}