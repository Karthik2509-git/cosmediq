import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DoctorSidebar from '../components/Sidebar'

export default async function DoctorPatients() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  // Get doctor record
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

  // Get unique patient IDs from appointments for this doctor
  const { data: doctorAppointments } = await supabase
    .from('appointments')
    .select('patient_id')
    .eq('doctor_id', doctorId)

  const patientIds = [...new Set(doctorAppointments?.map(a => a.patient_id) ?? [])]

  // Get patient details
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

        {patients?.length === 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-500">No patients assigned yet</p>
          </div>
        )}

        <div className="space-y-4">
          {patients?.map((patient) => {
            const name = (patient.users as any)?.full_name ?? 'Unknown'
            const email = (patient.users as any)?.email ?? ''
            const treatments = (patient.patient_treatments as any[])?.filter(t => t.status === 'active') ?? []
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
    </div>
  )
}