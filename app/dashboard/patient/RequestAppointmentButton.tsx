'use client'
import { useState, useEffect } from 'react'

export default function RequestAppointmentButton({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false)
  const [treatments, setTreatments] = useState<any[]>([])
  const [form, setForm] = useState({ treatment_id: '', preferred_date: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchTreatments() {
      const res = await fetch(`/api/patient/get-treatments?patient_id=${patientId}`)
      const data = await res.json()
      setTreatments(data.treatments ?? [])
    }
    if (open) fetchTreatments()
  }, [open, patientId])

  async function handleSubmit() {
    if (!form.preferred_date) {
      setMessage('❌ Please select a preferred date')
      return
    }
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/patient/request-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, patient_id: patientId }),
    })
    const data = await res.json()
    if (data.success) {
      setMessage('✅ Appointment requested! The clinic will confirm your slot.')
      setForm({ treatment_id: '', preferred_date: '', notes: '' })
      setTimeout(() => { setOpen(false); setMessage(''); window.location.reload() }, 2000)
    } else {
      setMessage('❌ ' + data.error)
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        + Request Appointment
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">Request Appointment</h3>
            <p className="text-gray-400 text-sm mb-6">The clinic will confirm your preferred slot.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Treatment</label>
                <select value={form.treatment_id} onChange={e => setForm({...form, treatment_id: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="">Select treatment</option>
                  {treatments.map(t => (
                    <option key={t.id} value={t.treatment_id}>
                      {t.treatments?.name} — {t.sittings_completed}/{t.sittings_total} sittings done
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Preferred Date & Time</label>
                <input type="datetime-local" value={form.preferred_date}
                  onChange={e => setForm({...form, preferred_date: e.target.value})}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  rows={2} placeholder="Any special requests or notes..." />
              </div>
              {message && <p className="text-sm">{message}</p>}
              <div className="flex gap-3">
                <button onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white rounded-lg px-4 py-2.5 text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  {loading ? 'Requesting...' : 'Request Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}