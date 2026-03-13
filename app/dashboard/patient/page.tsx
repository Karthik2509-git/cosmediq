import { SignOutButton } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

export default async function PatientDashboard() {

  // For demo - using Rahul Sharma's patient id
  const patientId = 'cccccccc-0001-0000-0000-000000000001'

  const { data: patient } = await supabase
    .from('patients')
    .select(`users ( full_name, email )`)
    .eq('id', patientId)
    .single()

  const { data: treatments } = await supabase
    .from('patient_treatments')
    .select(`
      id,
      sittings_completed,
      sittings_total,
      status,
      start_date,
      treatments ( name, category )
    `)
    .eq('patient_id', patientId)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      patient_treatments (
        treatments ( name )
      )
    `)
    .eq('patient_id', patientId)
    .order('scheduled_at')
    .limit(5)

  const name = (patient?.users as any)?.full_name ?? 'Patient'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Cosmediq</h1>
          <p className="text-xs text-gray-500">Patient Portal</p>
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

      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-2">Welcome, {name}</h2>
        <p className="text-gray-400 mb-8">Here's your treatment overview</p>

        {/* Treatment Progress Cards */}
        <h3 className="font-semibold text-lg mb-4">My treatments</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {treatments?.map((t) => {
            const name = (t.treatments as any)?.name ?? 'Unknown'
            const category = (t.treatments as any)?.category ?? ''
            const progress = Math.round((t.sittings_completed / t.sittings_total) * 100)
            const remaining = t.sittings_total - t.sittings_completed

            return (
              <div key={t.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-white">{name}</h4>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{category} treatment</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    t.status === 'active'
                      ? 'bg-green-900 text-green-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {t.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {t.sittings_completed} of {t.sittings_total} sittings done
                  </span>
                  <span className="text-blue-400 font-medium">
                    {remaining} remaining
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-3">
                  Started {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-lg mb-4">My appointments</h3>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const treatment = (apt.patient_treatments as any)?.treatments?.name ?? 'Unknown'
                const date = new Date(apt.scheduled_at)

                return (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{treatment}</p>
                      <p className="text-sm text-gray-400">
                        {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === 'completed'
                        ? 'bg-green-900 text-green-300'
                        : apt.status === 'scheduled'
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-yellow-900 text-yellow-300'
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
      </div>
    </div>
  )
}