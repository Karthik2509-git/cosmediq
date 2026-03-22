import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { SignOutButton } from '@clerk/nextjs'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import RequestAppointmentButton from './RequestAppointmentButton'

export default async function PatientDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const { data: userRecord } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRecord) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Profile not found</h2>
          <p className="text-gray-400 text-sm">Your account is not linked to a patient profile yet. Please contact the clinic.</p>
          <SignOutButton>
            <button className="mt-6 px-4 py-2 bg-white text-black rounded-lg text-sm">Sign out</button>
          </SignOutButton>
        </div>
      </div>
    )
  }

  const { data: patient } = await supabase
    .from('patients')
    .select('id, date_of_birth, blood_group, users ( full_name, email, phone )')
    .eq('user_id', userRecord.id)
    .single()

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Patient profile not found</h2>
          <p className="text-gray-400 text-sm">Please contact the clinic to set up your profile.</p>
          <SignOutButton>
            <button className="mt-6 px-4 py-2 bg-white text-black rounded-lg text-sm">Sign out</button>
          </SignOutButton>
        </div>
      </div>
    )
  }

  const { data: treatments } = await supabase
    .from('patient_treatments')
    .select(`
      id, sittings_completed, sittings_total, status, start_date,
      treatments ( name, category )
    `)
    .eq('patient_id', patient.id)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, status,
      patient_treatments ( treatments ( name ) )
    `)
    .eq('patient_id', patient.id)
    .order('scheduled_at')
    .limit(5)

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id, amount, status, method, created_at,
      appointments (
        scheduled_at,
        patient_treatments ( treatments ( name ) )
      )
    `)
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })

  const name = (patient.users as any)?.full_name ?? 'Patient'
  const email = (patient.users as any)?.email ?? ''
  const phone = (patient.users as any)?.phone ?? ''
  const totalPaid = payments?.reduce((sum, p) => sum + (p.status === 'paid' ? Number(p.amount) : 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Cosmediq" width={120} height={40} className="object-contain" />
          <span className="text-xs text-gray-500 border-l border-gray-700 pl-3">Patient Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{name}</span>
          <SignOutButton>
            <button className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Welcome, {name}</h2>
        <p className="text-gray-400 mb-8">Here's your treatment overview</p>

        {/* Profile card */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
          <h3 className="font-semibold text-lg mb-4">My Profile</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Full Name</p>
              <p className="text-sm text-white">{name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm text-white">{email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="text-sm text-white">{phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Blood Group</p>
              <p className="text-sm text-white">{patient.blood_group || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
              <p className="text-sm text-white">
                {patient.date_of_birth
                  ? new Date(patient.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Paid</p>
              <p className="text-sm text-green-400 font-medium">₹{totalPaid.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Treatments */}
        <h3 className="font-semibold text-lg mb-4">My Treatments</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {treatments?.map((t) => {
            const tname = (t.treatments as any)?.name ?? 'Unknown'
            const category = (t.treatments as any)?.category ?? ''
            const progress = t.sittings_total > 0 ? Math.round((t.sittings_completed / t.sittings_total) * 100) : 0
            const remaining = t.sittings_total - t.sittings_completed
            return (
              <div key={t.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-white">{tname}</h4>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{category} treatment</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                    {t.status}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t.sittings_completed} of {t.sittings_total} sittings done</span>
                  <span className="text-blue-400 font-medium">{remaining} remaining</span>
                </div>
                {t.start_date && (
                  <p className="text-xs text-gray-600 mt-3">
                    Started {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Appointments */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-4">
  <h3 className="font-semibold text-lg">My Appointments</h3>
  <RequestAppointmentButton patientId={patient.id} />
</div>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const treatment = (apt.patient_treatments as any)?.treatments?.name ?? 'Unknown'
                  const date = new Date(apt.scheduled_at)
                  return (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{treatment}</p>
                        <p className="text-xs text-gray-400">
                          {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        apt.status === 'completed' ? 'bg-green-900 text-green-300' :
                        apt.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
                        apt.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No appointments found.</p>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold text-lg mb-4">Payment History</h3>
            {payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((p) => {
                  const treatment = (p.appointments as any)?.patient_treatments?.treatments?.name ?? 'General'
                  const date = new Date(p.created_at)
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400 capitalize">{treatment} — {p.method}</p>
                        <p className="text-xs text-gray-500">
                          {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        p.status === 'paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No payments found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}