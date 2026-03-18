'use client'
import { useState, useEffect } from 'react'

interface Patient {
  id: string
  users: any
}

export default function RecordPaymentButton({ patients }: { patients: Patient[] }) {
  const [open, setOpen] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [form, setForm] = useState({ patient_id: '', appointment_id: '', amount: '', method: 'cash', status: 'paid' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function fetchAppointments(patient_id: string) {
    if (!patient_id) { setAppointments([]); return }
    const res = await fetch(`/api/staff/get-patient-appointments?patient_id=${patient_id}`)
    const data = await res.json()
    setAppointments(data.appointments ?? [])
  }

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/staff/add-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      setMessage('✅ Payment recorded!')
      setForm({ patient_id: '', appointment_id: '', amount: '', method: 'cash', status: 'paid' })
      setAppointments([])
      setTimeout(() => { setOpen(false); setMessage(''); window.location.reload() }, 1500)
    } else {
      setMessage('❌ ' + data.error)
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        + Record Payment
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="font-bold text-lg mb-6">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Patient</label>
                <select value={form.patient_id} onChange={e => {
                  setForm({...form, patient_id: e.target.value, appointment_id: ''})
                  fetchAppointments(e.target.value)
                }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="">Select patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{(p.users as any)?.full_name}</option>
                  ))}
                </select>
              </div>

              {appointments.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Link to Appointment (optional)</label>
                  <select value={form.appointment_id} onChange={e => setForm({...form, appointment_id: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select appointment</option>
                    {appointments.map((a: any) => {
                      const date = new Date(a.scheduled_at)
                      const treatment = a.patient_treatments?.treatments?.name ?? 'Unknown'
                      return (
                        <option key={a.id} value={a.id}>
                          {treatment} — {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter amount" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Payment Method</label>
                <select value={form.method} onChange={e => setForm({...form, method: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              {message && <p className="text-sm">{message}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => { setOpen(false); setAppointments([]) }}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white rounded-lg px-4 py-2.5 text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}