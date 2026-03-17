'use client'
import { useState } from 'react'

export default function MarkCompleteButton({ appointmentId, patientTreatmentId, currentStatus }: {
  appointmentId: string
  patientTreatmentId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(currentStatus === 'completed')

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/doctor/complete-sitting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, patientTreatmentId }),
    })
    const data = await res.json()
    if (data.success) {
      setDone(true)
      window.location.reload()
    }
    setLoading(false)
  }

  if (done) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-green-900 text-green-300">
        completed
      </span>
    )
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors">
      {loading ? 'Saving...' : 'Mark Complete'}
    </button>
  )
}