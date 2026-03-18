'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function PatientSearch({ patients }: { patients: any[] }) {
  const [search, setSearch] = useState('')

  const filtered = patients.filter(p => {
    const name = p.users?.full_name?.toLowerCase() ?? ''
    const email = p.users?.email?.toLowerCase() ?? ''
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patients by name or email..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {filtered.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-500">No patients found matching "{search}"</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((patient: any) => {
          const name = patient.users?.full_name ?? 'Unknown'
          const email = patient.users?.email ?? ''
          const treatments = (patient.patient_treatments as any[])?.filter((t: any) => t.status === 'active') ?? []
          const age = patient.date_of_birth
            ? Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / 3.15576e10)
            : null

          return (
            <div key={patient.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                    {name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{name}</h3>
                    <p className="text-sm text-gray-400">{email}</p>
                    <div className="flex gap-3 mt-1">
                      {age && <span className="text-xs text-gray-500">Age {age}</span>}
                      {patient.blood_group && (
                        <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">
                          {patient.blood_group}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {treatments.length} active treatment{treatments.length !== 1 ? 's' : ''}
                </span>
              </div>

              {treatments.length > 0 ? (
                <div className="space-y-3">
                  {treatments.map((t: any) => {
                    const progress = t.sittings_total > 0
                      ? Math.round((t.sittings_completed / t.sittings_total) * 100)
                      : 0
                    return (
                      <div key={t.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-white">{t.treatments?.name}</p>
                          <p className="text-xs text-gray-400">{t.sittings_completed}/{t.sittings_total} sittings</p>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No active treatments</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}