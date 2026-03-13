import { SignOutButton } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export default async function StaffDashboard() {
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      patients ( id, users ( full_name ) ),
      doctors ( users ( full_name ) ),
      patient_treatments (
        sittings_completed,
        sittings_total,
        treatments ( name )
      ),
      branches ( name )
    `)
    .order('scheduled_at')

  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })

  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })

  const { count: activetreatments } = await supabase
    .from('patient_treatments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <div className="w-64 border-r border-gray-800 flex flex-col min-h-screen">
        <div className="px-6 py-5 border-b border-gray-800">
          <Image src="/logo.png" alt="Cosmediq" width={120} height={40} className="object-contain" />
          <p className="text-xs text-gray-500 mt-1">Staff Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { label: 'Dashboard', href: '/dashboard/staff', active: true },
            { label: 'Payments', href: '/dashboard/staff/payments' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active ? 'bg-gray-800 text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium">Staff</p>
            <p className="text-xs text-gray-500">Cosmediq Vizag</p>
          </div>
          <SignOutButton>
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>

      <div className="flex-1 px-8 py-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Staff Dashboard</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total patients', value: totalPatients ?? 0 },
            { label: 'Total appointments', value: totalAppointments ?? 0 },
            { label: 'Active treatments', value: activetreatments ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-lg mb-4">All appointments</h3>
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
                {appointments?.map((apt) => {
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
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 text-gray-400">{branch}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          apt.status === 'completed' ? 'bg-green-900 text-green-300' :
                          apt.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
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
      </div>
    </div>
  )
}