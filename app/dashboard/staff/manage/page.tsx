'use client'
import { useState, useEffect } from 'react'
import StaffSidebar from '../components/Sidebar'

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments' | 'branches' | 'doctors' | 'assign' | 'staff'>('patients')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <StaffSidebar active="Manage" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-2">Manage</h2>
        <p className="text-gray-400 mb-6">Add and manage clinic data</p>

        <div className="flex gap-2 mb-8 border-b border-gray-800 flex-wrap">
          {(['patients', 'appointments', 'assign', 'branches', 'doctors', 'staff'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'assign' ? 'Assign Treatment' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'patients' && <PatientsTab />}
        {activeTab === 'appointments' && <AppointmentsTab />}
        {activeTab === 'assign' && <AssignTreatmentTab />}
        {activeTab === 'branches' && <BranchesTab />}
        {activeTab === 'doctors' && <DoctorsTab />}
        {activeTab === 'staff' && <StaffTab />}
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
    const res = await fetch('/api/admin/invite-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'doctor' }),
    })
    const data = await res.json()
    setMessage(data.success ? '✅ Doctor invited! They will receive an email to set up their login.' : '❌ ' + data.error)
    if (data.success) setForm({ full_name: '', email: '', phone: '', specialization: '', qualification: '' })
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg mb-2">Invite New Doctor</h3>
      <p className="text-gray-400 text-sm mb-6">Doctor will receive an email invite to set up their login.</p>
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
          {loading ? 'Sending invite...' : 'Send Invite to Doctor'}
        </button>
      </div>
    </div>
  )
}

function StaffTab() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/admin/invite-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'staff' }),
    })
    const data = await res.json()
    setMessage(data.success ? '✅ Staff member invited! They will receive an email to set up their login.' : '❌ ' + data.error)
    if (data.success) setForm({ full_name: '', email: '', phone: '' })
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg mb-2">Invite New Staff Member</h3>
      <p className="text-gray-400 text-sm mb-6">Staff member will receive an email invite to set up their login.</p>
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
        {message && <p className="text-sm">{message}</p>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
          {loading ? 'Sending invite...' : 'Send Invite to Staff'}
        </button>
      </div>
    </div>
  )
}

function AssignTreatmentTab() {
    const [patients, setPatients] = useState<any[]>([])
    const [treatments, setTreatments] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [form, setForm] = useState({ patient_id: '', treatment_id: '', doctor_id: '', start_date: '' })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [message, setMessage] = useState('')
  
    useEffect(() => {
      async function fetchData() {
        const [pRes, tRes, dRes] = await Promise.all([
          fetch('/api/staff/get-patients'),
          fetch('/api/staff/get-treatments'),
          fetch('/api/staff/get-doctors'),
        ])
        const pData = await pRes.json()
        const tData = await tRes.json()
        const dData = await dRes.json()
        setPatients(pData.patients ?? [])
        setTreatments(tData.treatments ?? [])
        setDoctors(dData.doctors ?? [])
        setFetching(false)
      }
      fetchData()
    }, [])
  
    async function handleSubmit() {
      setLoading(true)
      setMessage('')
      const res = await fetch('/api/staff/assign-treatment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setMessage(data.success ? '✅ Treatment assigned!' : '❌ ' + data.error)
      if (data.success) setForm({ patient_id: '', treatment_id: '', doctor_id: '', start_date: '' })
      setLoading(false)
    }
  
    if (fetching) return <p className="text-gray-400 text-sm">Loading...</p>
  
    return (
      <div className="max-w-lg">
        <h3 className="font-semibold text-lg mb-6">Assign Treatment to Patient</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Patient</label>
            <select value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{(p.users as any)?.full_name} — {(p.users as any)?.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Treatment</label>
            <select value={form.treatment_id} onChange={e => setForm({...form, treatment_id: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select treatment</option>
              {treatments.map(t => (
                <option key={t.id} value={t.id}>{t.name} — ₹{Number(t.price_per_sitting).toLocaleString('en-IN')}/sitting</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Doctor</label>
            <select value={form.doctor_id} onChange={e => setForm({...form, doctor_id: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{(d.users as any)?.full_name} — {d.specialization}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
            <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          {message && <p className="text-sm">{message}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
            {loading ? 'Assigning...' : 'Assign Treatment'}
          </button>
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
    const res = await fetch('/api/admin/invite-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'patient' }),
    })
    const data = await res.json()
    setMessage(data.success ? '✅ Patient invited! They will receive an email to set up their login.' : '❌ ' + data.error)
    if (data.success) setForm({ full_name: '', email: '', phone: '', date_of_birth: '', blood_group: '' })
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-lg mb-2">Invite New Patient</h3>
      <p className="text-gray-400 text-sm mb-6">Patient will receive an email invite to set up their login.</p>
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
          {loading ? 'Sending invite...' : 'Send Invite to Patient'}
        </button>
      </div>
    </div>
  )
}

function AppointmentsTab() {
    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [branches, setBranches] = useState<any[]>([])
    const [treatments, setTreatments] = useState<any[]>([])
    const [fetching, setFetching] = useState(true)
    const [form, setForm] = useState({
      patient_id: '',
      doctor_id: '',
      branch_id: '',
      treatment_id: '',
      scheduled_at: '',
      notes: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
  
    useEffect(() => {
      async function fetchData() {
        const [pRes, dRes, bRes, tRes] = await Promise.all([
          fetch('/api/staff/get-patients'),
          fetch('/api/staff/get-doctors'),
          fetch('/api/staff/get-branches'),
          fetch('/api/staff/get-treatments'),
        ])
        const pData = await pRes.json()
        const dData = await dRes.json()
        const bData = await bRes.json()
        const tData = await tRes.json()
        setPatients(pData.patients ?? [])
        setDoctors(dData.doctors ?? [])
        setBranches(bData.branches ?? [])
        setTreatments(tData.treatments ?? [])
        setFetching(false)
      }
      fetchData()
    }, [])
  
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
      if (data.success) setForm({ patient_id: '', doctor_id: '', branch_id: '', treatment_id: '', scheduled_at: '', notes: '' })
      setLoading(false)
    }
  
    if (fetching) return <p className="text-gray-400 text-sm">Loading...</p>
  
    return (
      <div className="max-w-lg">
        <h3 className="font-semibold text-lg mb-6">Schedule Appointment</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Patient</label>
            <select value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{(p.users as any)?.full_name} — {(p.users as any)?.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Doctor</label>
            <select value={form.doctor_id} onChange={e => setForm({...form, doctor_id: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{(d.users as any)?.full_name} — {d.specialization}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Branch</label>
            <select value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Treatment</label>
            <select value={form.treatment_id} onChange={e => setForm({...form, treatment_id: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option value="">Select treatment</option>
              {treatments.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
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