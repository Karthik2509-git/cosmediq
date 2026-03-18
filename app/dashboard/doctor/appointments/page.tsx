import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DoctorSidebar from '../components/Sidebar'
import AppointmentFilters from './AppointmentFilters'

export default async function DoctorAppointments() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  const { data: doctorRecord } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userRecord?.id)
    .single()

  const doctorId = doctorRecord?.id

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, status, notes,
      patients ( users ( full_name ) ),
      patient_treatments (
        id, sittings_completed, sittings_total,
        treatments ( name )
      ),
      branches ( name )
    `)
    .eq('doctor_id', doctorId)
    .order('scheduled_at')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <DoctorSidebar active="Appointments" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-2">Appointments</h2>
        <p className="text-gray-400 mb-8">{appointments?.length ?? 0} total appointments</p>
        <AppointmentFilters appointments={appointments ?? []} />
      </div>
    </div>
  )
}