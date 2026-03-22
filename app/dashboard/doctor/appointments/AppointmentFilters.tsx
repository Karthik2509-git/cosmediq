'use client'
import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import AppointmentActions from './AppointmentActions'

const PAGE_SIZE = 10

export default function AppointmentFilters({ appointments }: { appointments: any[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = appointments.filter(apt => {
    const name = (apt.patients as any)?.users?.full_name?.toLowerCase() ?? ''
    const treatment = (apt.patient_treatments as any)?.treatments?.name?.toLowerCase() ?? ''
    const q = search.toLowerCase()
    const matchesSearch = name.includes(q) || treatment.includes(q)
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  function handleStatus(val: string) {
    setStatusFilter(val)
    setPage(1)
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search by patient or treatment..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => handleStatus(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="noshow">No-show</option>
        </select>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800 bg-gray-900">
              <th className="text-left px-6 py-4 font-medium">Patient</th>
              <th className="text-left px-6 py-4 font-medium">Treatment</th>
              <th className="text-left px-6 py-4 font-medium">Progress</th>
              <th className="text-left px-6 py-4 font-medium">Branch</th>
              <th className="text-left px-6 py-4 font-medium">Date & Time</th>
              <th className="text-left px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}
            {paginated.map((apt) => {
              const name = (apt.patients as any)?.users?.full_name ?? 'Unknown'
              const treatment = (apt.patient_treatments as any)?.treatments?.name ?? 'Unknown'
              const done = (apt.patient_treatments as any)?.sittings_completed ?? 0
              const total = (apt.patient_treatments as any)?.sittings_total ?? 0
              const ptId = (apt.patient_treatments as any)?.id
              const branch = (apt.branches as any)?.name ?? 'Unknown'
              const date = new Date(apt.scheduled_at)
              const progress = total > 0 ? Math.round((done / total) * 100) : 0

              return (
                <tr key={apt.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                        {name[0]}
                      </div>
                      <span className="font-medium">{name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{treatment}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{done}/{total}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{branch}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                  <td className="px-6 py-4">
                    <AppointmentActions
                      appointmentId={apt.id}
                      patientTreatmentId={ptId}
                      currentStatus={apt.status}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}