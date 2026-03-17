import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { SignOutButton } from '@clerk/nextjs'
import DoctorSidebar from '../staff/components/Sidebar'

export default async function DoctorDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, status,
      patients ( id, users ( full_name ) ),
      patient_treatments (
        sittings_completed, sittings_total,
        treatments ( name )
      )
    `)
    .gte('scheduled_at', today.toISOString())
    .lte('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at')

  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })

  const { count: activetreatments } = await supabase
    .from('patient_treatments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: completedToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('scheduled_at', today.toISOString())

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <DoctorSidebar active="Dashboard" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-2">Good morning, Dr. Karthik</h2>
        <p className="text-gray-400 mb-8">Here's what's happening today</p>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today's appointments", value: appointments?.length ?? 0 },
            { label: 'Active patients', value: totalPatients ?? 0 },
            { label: 'Active treatments', value: activetreatments ?? 0 },
            { label: 'Completed today', value: completedToday ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Today's appointments</h3>
            <Link href="/dashboard/doctor/appointments" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const name = (apt.patients as any)?.users?.full_name ?? 'Unknown'
                const treatment = (apt.patient_treatments as any)?.treatments?.name ?? 'Unknown'
                const done = (apt.patient_treatments as any)?.sittings_completed ?? 0
                const total = (apt.patient_treatments as any)?.sittings_total ?? 0
                const time = new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                const progress = Math.round((done / total) * 100)

                return (
                  <div key={apt.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                          {name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{name}</p>
                          <p className="text-xs text-gray-400">{treatment} — Sitting {done}/{total}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{time}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          apt.status === 'completed' ? 'bg-green-900 text-green-300' :
                          apt.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
                          'bg-yellow-900 text-yellow-300'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Treatment progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No appointments today.</p>
          )}
        </div>
      </div>
    </div>
  )
}