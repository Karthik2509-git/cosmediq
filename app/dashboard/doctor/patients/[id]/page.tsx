import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DoctorSidebar from '../../components/Sidebar'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PatientProfile(props: Props) {
  const { id } = await props.params
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const { data: patient } = await supabase
    .from('patients')
    .select(`id, date_of_birth, blood_group, users ( full_name, email, phone )`)
    .eq('id', id)
    .single()

  const { data: treatments } = await supabase
    .from('patient_treatments')
    .select(`id, sittings_completed, sittings_total, status, start_date, treatments ( name, category, price_per_sitting )`)
    .eq('patient_id', id)
    .order('start_date', { ascending: false })

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`id, scheduled_at, status, patient_treatments ( treatments ( name ) ), branches ( name )`)
    .eq('patient_id', id)
    .order('scheduled_at', { ascending: false })

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, status, method, created_at')
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

    console.log('ID:', id, 'Patient:', patient)
    if (!patient) redirect('/dashboard/doctor/patients')

  const name = (patient.users as any)?.full_name ?? 'Unknown'
  const email = (patient.users as any)?.email ?? ''
  const phone = (patient.users as any)?.phone ?? ''
  const age = patient.date_of_birth
    ? Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / 3.15576e10)
    : null
  const totalPaid = payments?.reduce((sum, p) => sum + (p.status === 'paid' ? Number(p.amount) : 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <DoctorSidebar active="My Patients" />
      <div className="flex-1 px-8 py-8 overflow-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/doctor/patients" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← My Patients
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-white">{name}</span>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
                {name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-gray-400 text-sm">{email}</p>
                <div className="flex gap-3 mt-2">
                  {age && <span className="text-xs text-gray-500">Age {age}</span>}
                  {phone && <span className="text-xs text-gray-500">{phone}</span>}
                  {patient.blood_group && (
                    <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">{patient.blood_group}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total paid</p>
              <p className="text-xl font-bold text-green-400">₹{totalPaid.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold text-lg mb-4">Treatments</h3>
            <div className="space-y-4">
              {treatments?.map((t) => {
                const tname = (t.treatments as any)?.name ?? 'Unknown'
                const price = (t.treatments as any)?.price_per_sitting
                const progress = t.sittings_total > 0 ? Math.round((t.sittings_completed / t.sittings_total) * 100) : 0
                return (
                  <div key={t.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{tname}</p>
                        {price && <p className="text-xs text-gray-500">₹{Number(price).toLocaleString('en-IN')}/sitting</p>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t.sittings_completed}/{t.sittings_total} sittings</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    {t.start_date && (
                      <p className="text-xs text-gray-600 mt-2">
                        Started {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )
              })}
              {treatments?.length === 0 && <p className="text-gray-500 text-sm">No treatments</p>}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold text-lg mb-4">Payment History</h3>
            <div className="space-y-3">
              {payments?.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.method} — {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
              {payments?.length === 0 && <p className="text-gray-500 text-sm">No payments</p>}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-lg mb-4">Appointment History</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left pb-3 font-medium">Treatment</th>
                <th className="text-left pb-3 font-medium">Branch</th>
                <th className="text-left pb-3 font-medium">Date & Time</th>
                <th className="text-left pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {appointments?.map((apt) => {
                const treatment = (apt.patient_treatments as any)?.treatments?.name ?? 'Unknown'
                const branch = (apt.branches as any)?.name ?? 'Unknown'
                const date = new Date(apt.scheduled_at)
                return (
                  <tr key={apt.id} className="hover:bg-gray-800 transition-colors">
                    <td className="py-3 font-medium">{treatment}</td>
                    <td className="py-3 text-gray-400">{branch}</td>
                    <td className="py-3 text-gray-400">
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
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
              {appointments?.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No appointments</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}