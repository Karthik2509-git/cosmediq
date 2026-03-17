'use client'
import { useState } from 'react'

export default function AddTreatmentButton() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: 'hair',
    description: '',
    total_sittings: '',
    price_per_sitting: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/doctor/add-treatment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      setMessage('✅ Treatment added!')
      setForm({ name: '', category: 'hair', description: '', total_sittings: '', price_per_sitting: '' })
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
        + Add Treatment
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="font-bold text-lg mb-6">Add New Treatment</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Treatment Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. FUE Hair Transplant" />
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
                  rows={2} placeholder="Brief description" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Total Sittings</label>
                <input type="number" value={form.total_sittings} onChange={e => setForm({...form, total_sittings: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 8" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Price per Sitting (₹)</label>
                <input type="number" value={form.price_per_sitting} onChange={e => setForm({...form, price_per_sitting: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 15000" />
              </div>
              {message && <p className="text-sm">{message}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white rounded-lg px-4 py-2.5 text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  {loading ? 'Adding...' : 'Add Treatment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}