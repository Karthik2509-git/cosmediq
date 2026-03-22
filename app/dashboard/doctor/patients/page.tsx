import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DoctorSidebar from '../components/Sidebar'
import PatientSearch from './PatientSearch'

export default async function DoctorPatients() {
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

  const { data: doctorAppointments } = await supabase
    .from('appointments')
    .select('patient_id')
    .eq('doctor_id', doctorId)

  const patientIds = [...new Set(doctorAppointments?.map(a => a.patient_id) ?? [])]

  const { data: patients } = await supabase
    .from('patients')
    .select(`
      id,
      date_of_birth,
      blood_group,
      users ( full_name, email, phone ),
      patient_treatments (
        id,
        sittings_completed,
        sittings_total,
        status,
        treatments ( name, category )
      )
    `)
    .in('id', patientIds.length > 0 ? patientIds : ['00000000-0000-0000-0000-000000000000'])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <DoctorSidebar active="My Patients" />
      <div className="flex-1 px-8 py-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-2">My Patients</h2>
        <p className="text-gray-400 mb-8">{patients?.length ?? 0} patients under your care</p>
        <PatientSearch patients={patients ?? []} />
      </div>
    </div>
  )
}