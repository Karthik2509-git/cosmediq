'use client'
import { useState } from 'react'

interface Treatment {
  id: string
  name: string
  category: string
  description: string | null
  total_sittings: number
  price_per_sitting: number | null
}

export default function EditTreatmentButton({ treatment }: { treatment: Treatment }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: treatment.name,
    category: treatment.category ?? 'hair',
    description: treatment.description ?? '',
    total_sittings: String(treatment.total_sittings),
    price_per_sitting: String(treatment.price_per_sitting ?? ''),
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/doctor/edit-treatment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: treatment.id, ...form }),
    })
    const data = await res.json()
    if (data.success) {
      setMessage('✅ Treatment updated!')
      setTimeout(() => { setOpen(false); setMessage(''); window.location.reload() }, 1500)
    } else {
      setMessage('❌ ' + data.error)
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="font-bold text-lg mb-6">Edit Treatment</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Treatment Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="hair">Hair</option>
                  <option value="skin">Skin</option>
                  <option value="prp">PRP</option>
                  <option value="laser">Laser</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  rows={2} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Total Sittings</label>
                <input type="number" value={form.total_sittings} onChange={e => setForm({...form, total_sittings: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Price per Sitting (₹)</label>
                <input type="number" value={form.price_per_sitting} onChange={e => setForm({...form, price_per_sitting: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              {message && <p className="text-sm">{message}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white rounded-lg px-4 py-2.5 text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}