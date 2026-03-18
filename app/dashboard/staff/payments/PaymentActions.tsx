'use client'
import { useState } from 'react'

export default function PaymentActions({ paymentId, currentStatus }: {
  paymentId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function markAsPaid() {
    setLoading(true)
    const res = await fetch('/api/staff/update-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, status: 'paid' }),
    })
    const data = await res.json()
    if (data.success) {
      setStatus('paid')
      window.location.reload()
    }
    setLoading(false)
  }

  async function deletePayment() {
    if (!confirm('Are you sure you want to delete this payment?')) return
    setLoading(true)
    const res = await fetch('/api/staff/delete-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    })
    const data = await res.json()
    if (data.success) window.location.reload()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'pending' && (
        <button onClick={markAsPaid} disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-green-900 text-green-300 hover:bg-green-800 disabled:opacity-50 transition-colors">
          {loading ? '...' : 'Mark Paid'}
        </button>
      )}
      <button onClick={deletePayment} disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-900 disabled:opacity-50 transition-colors">
        {loading ? '...' : 'Delete'}
      </button>
    </div>
  )
}