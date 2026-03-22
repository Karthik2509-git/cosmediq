'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PendingBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      const res = await fetch('/api/admin/pending-count')
      const data = await res.json()
      setCount(data.count ?? 0)
    }
    fetchCount()
    // Refresh every 60 seconds
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  if (count === 0) return null

  return (
    <Link href="/dashboard/staff/users"
      className="flex items-center gap-3 px-3 py-3 mx-3 mb-2 bg-yellow-950 border border-yellow-800 rounded-lg text-sm transition-colors hover:bg-yellow-900">
      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
      <span className="text-yellow-300 flex-1">{count} pending role{count !== 1 ? 's' : ''}</span>
      <span className="text-yellow-400 text-xs">→</span>
    </Link>
  )
}