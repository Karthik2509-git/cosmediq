'use client'
import { useState } from 'react'
import StaffSidebar from '../components/Sidebar'

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments' | 'branches' | 'doctors'>('patients')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <StaffSidebar active="Manage" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-2">Manage</h2>
        <p className="text-gray-400 mb-6">Add and manage clinic data</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          {(['patients', 'appointments', 'branches', 'doctors'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'patients' && <PatientsTab />}
        {activeTab === 'appointments' && <AppointmentsTab />}
        {activeTab === 'branches' && <BranchesTab />}
        {activeTab === 'doctors' && <DoctorsTab />}
      </div>
    </div>
  )
}

function PatientsTab() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', date_of_birth: '', blood_group: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/staff/add-patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setMessage(data.success ? '✅ Patient added successfully!' : '❌ ' + data.error)
    if (data.success) setForm({ full_name: '', email: '', phone: '', date_of_birth: '', blood_group: '' })
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg mb-6">Add New Patient</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
          <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter full name" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Email</label>
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter email" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Phone</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter phone number" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Date of Birth</label>
          <input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Blood Group</label>
          <select value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
            <option value="">Select blood group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        {message && <p className="text-sm">{message}</p>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
          {loading ? 'Adding...' : 'Add Patient'}
        </button>
      </div>
    </div>
  )
}

function AppointmentsTab() {
  const [form, setForm] = useState({ patient_email: '', scheduled_at: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/staff/add-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setMessage(data.success ? '✅ Appointment scheduled!' : '❌ ' + data.error)
    if (data.success) setForm({ patient_email: '', scheduled_at: '', notes: '' })
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg mb-6">Schedule Appointment</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Patient Email</label>
          <input value={form.patient_email} onChange={e => setForm({...form, patient_email: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter patient email" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Date & Time</label>
          <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" rows={3} placeholder="Any notes..." />
        </div>
        {message && <p className="text-sm">{message}</p>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </button>
      </div>
    </div>
  )
}

function BranchesTab() {
  const [form, setForm] = useState({ name: '', city: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/staff/add-branch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setMessage(data.success ? '✅ Branch added!' : '❌ ' + data.error)
    if (data.success) setForm({ name: '', city: '', address: '' })
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg mb-6">Add New Branch</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Branch Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Cosmediq Hyderabad" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">City</label>
          <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter city" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Address</label>
          <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" rows={3} placeholder="Enter full address" />
        </div>
        {message && <p className="text-sm">{message}</p>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
          {loading ? 'Adding...' : 'Add Branch'}
        </button>
      </div>
    </div>
  )
}

function DoctorsTab() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', specialization: '', qualification: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/staff/add-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setMessage(data.success ? '✅ Doctor added!' : '❌ ' + data.error)
    if (data.success) setForm({ full_name: '', email: '', phone: '', specialization: '', qualification: '' })
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg mb-6">Add New Doctor</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
          <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter doctor's full name" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Email</label>
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter email" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Phone</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter phone number" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Specialization</label>
          <input value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Hair & Skin" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Qualification</label>
          <input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. MBBS, MD Dermatology" />
        </div>
        {message && <p className="text-sm">{message}</p>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
          {loading ? 'Adding...' : 'Add Doctor'}
        </button>
      </div>
    </div>
  )
}