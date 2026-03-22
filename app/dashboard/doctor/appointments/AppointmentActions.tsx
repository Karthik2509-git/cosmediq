'use client'
import { useState } from 'react'

export default function AppointmentActions({ appointmentId, patientTreatmentId, currentStatus }: {
  appointmentId: string
  patientTreatmentId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [showReschedule, setShowReschedule] = useState(false)
  const [newDateTime, setNewDateTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleAction(action: 'complete' | 'cancel' | 'noshow') {
    setLoading(true)
    setMessage('')
  
    const res = await fetch('/api/doctor/appointment-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, patientTreatmentId, action }),
    })
    const data = await res.json()
    if (data.success) {
      setStatus(action === 'complete' ? 'completed' : action === 'cancel' ? 'cancelled' : 'noshow')
      if (action === 'complete') {
        setMessage('✅ Sitting completed! Please remind staff to record payment.')
        setTimeout(() => { setMessage(''); window.location.reload() }, 3000)
      } else {
        window.location.reload()
      }
    } else {
      setMessage(data.error)
    }
    setLoading(false)
  }

  async function handleReschedule() {
    if (!newDateTime) return
    setLoading(true)
    setMessage('')

    const res = await fetch('/api/doctor/reschedule-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, scheduled_at: newDateTime }),
    })
    const data = await res.json()
    if (data.success) {
      setShowReschedule(false)
      window.location.reload()
    } else {
      setMessage(data.error)
    }
    setLoading(false)
  }

  if (status === 'completed') {
    return <span className="text-xs px-2 py-1 rounded-full bg-green-900 text-green-300">completed</span>
  }

  if (status === 'cancelled') {
    return <span className="text-xs px-2 py-1 rounded-full bg-red-900 text-red-300">cancelled</span>
  }

  if (status === 'noshow') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-900 text-yellow-300">no-show</span>
        <button onClick={() => setShowReschedule(true)}
          className="text-xs px-2 py-1 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors">
          Reschedule
        </button>
        {showReschedule && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-bold mb-4">Reschedule Appointment</h3>
              <input type="datetime-local" value={newDateTime} onChange={e => setNewDateTime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 mb-4" />
              {message && <p className="text-sm text-red-400 mb-3">{message}</p>}
              <div className="flex gap-3">
                <button onClick={() => setShowReschedule(false)}
                  className="flex-1 border border-gray-700 text-gray-400 rounded-lg px-4 py-2 text-sm">
                  Cancel
                </button>
                <button onClick={handleReschedule} disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm">
                  {loading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button onClick={() => handleAction('complete')} disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors">
          {loading ? '...' : 'Complete'}
        </button>
        <button onClick={() => setShowReschedule(true)} disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors">
          Reschedule
        </button>
        <button onClick={() => handleAction('noshow')} disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg border border-yellow-900 text-yellow-400 hover:bg-yellow-900 transition-colors">
          No-show
        </button>
        <button onClick={() => handleAction('cancel')} disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-900 transition-colors">
          Cancel
        </button>
      </div>
      {message && <p className="text-xs text-red-400">{message}</p>}

      {showReschedule && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold mb-4">Reschedule Appointment</h3>
            <input type="datetime-local" value={newDateTime} onChange={e => setNewDateTime(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 mb-4" />
            {message && <p className="text-sm text-red-400 mb-3">{message}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowReschedule(false)}
                className="flex-1 border border-gray-700 text-gray-400 rounded-lg px-4 py-2 text-sm">
                Cancel
              </button>
              <button onClick={handleReschedule} disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm">
                {loading ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}