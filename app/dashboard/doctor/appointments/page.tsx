import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DoctorSidebar from '../components/Sidebar'
import MarkCompleteButton from './MarkCompleteButton'

export default async function DoctorAppointments() {
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

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800 bg-gray-900">
                <th className="text-left px-6 py-4 font-medium">Patient</th>
                <th className="text-left px-6 py-4 font-medium">Treatment</th>
                <th className="text-left px-6 py-4 font-medium">Progress</th>
                <th className="text-left px-6 py-4 font-medium">Branch</th>
                <th className="text-left px-6 py-4 font-medium">Date & Time</th>
                <th className="text-left px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {appointments?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
              {appointments?.map((apt) => {
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
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <MarkCompleteButton
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
        </div>
      </div>
    </div>
  )
}