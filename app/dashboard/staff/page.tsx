import { supabase } from '@/lib/supabase'
import StaffSidebar from './components/Sidebar'
import StaffDashboardClient from './StaffDashboardClient'

export default async function StaffDashboard() {
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, status,
      patients ( id, users ( full_name ) ),
      doctors ( users ( full_name ) ),
      patient_treatments (
        sittings_completed, sittings_total,
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
      <StaffSidebar active="Dashboard" />
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
        <StaffDashboardClient appointments={appointments ?? []} />
      </div>
    </div>
  )
}