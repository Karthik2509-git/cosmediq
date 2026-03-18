'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function StaffDashboardClient({ appointments }: { appointments: any[] }) {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0)
  const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999)
  const weekEnd = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + 7)
  const monthEnd = new Date(todayStart); monthEnd.setMonth(monthEnd.getMonth() + 1)

  const filtered = appointments.filter(apt => {
    const patient = (apt.patients as any)?.users?.full_name?.toLowerCase() ?? ''
    const treatment = (apt.patient_treatments as any)?.treatments?.name?.toLowerCase() ?? ''
    const q = search.toLowerCase()
    const matchesSearch = patient.includes(q) || treatment.includes(q)
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
    const date = new Date(apt.scheduled_at)
    let matchesDate = true
    if (dateFilter === 'today') matchesDate = date >= todayStart && date <= todayEnd
    else if (dateFilter === 'week') matchesDate = date >= todayStart && date <= weekEnd
    else if (dateFilter === 'month') matchesDate = date >= todayStart && date <= monthEnd
    return matchesSearch && matchesStatus && matchesDate
  })

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">All appointments</h3>
        <span className="text-xs text-gray-500">{filtered.length} shown</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or treatment..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="noshow">No-show</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left pb-3 font-medium">Patient</th>
              <th className="text-left pb-3 font-medium">Treatment</th>
              <th className="text-left pb-3 font-medium">Progress</th>
              <th className="text-left pb-3 font-medium">Doctor</th>
              <th className="text-left pb-3 font-medium">Date & Time</th>
              <th className="text-left pb-3 font-medium">Branch</th>
              <th className="text-left pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}
            {filtered.map((apt) => {
              const patient = (apt.patients as any)?.users?.full_name ?? 'Unknown'
              const doctor = (apt.doctors as any)?.users?.full_name ?? 'Unknown'
              const treatment = (apt.patient_treatments as any)?.treatments?.name ?? 'Unknown'
              const done = (apt.patient_treatments as any)?.sittings_completed ?? 0
              const total = (apt.patient_treatments as any)?.sittings_total ?? 0
              const branch = (apt.branches as any)?.name ?? 'Unknown'
              const date = new Date(apt.scheduled_at)

              return (
                <tr key={apt.id} className="hover:bg-gray-800 transition-colors">
                  <td className="py-3 font-medium">{patient}</td>
                  <td className="py-3 text-gray-300">{treatment}</td>
                  <td className="py-3 text-gray-400">{done}/{total} sittings</td>
                  <td className="py-3 text-gray-300">{doctor}</td>
                  <td className="py-3 text-gray-400">
                    {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                  <td className="py-3 text-gray-400">{branch}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === 'completed' ? 'bg-green-900 text-green-300' :
                      apt.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
                      apt.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}