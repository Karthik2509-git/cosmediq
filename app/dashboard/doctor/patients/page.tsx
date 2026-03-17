import { supabase } from '@/lib/supabase'
import DoctorSidebar from '../components/Sidebar'

export default async function DoctorPatients() {
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

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <DoctorSidebar active="My Patients" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-2">My Patients</h2>
        <p className="text-gray-400 mb-8">{patients?.length ?? 0} patients under your care</p>

        <div className="space-y-4">
          {patients?.map((patient) => {
            const name = (patient.users as any)?.full_name ?? 'Unknown'
            const email = (patient.users as any)?.email ?? ''
            const treatments = patient.patient_treatments as any[]
            const activeTreatment = treatments?.find(t => t.status === 'active')
            const treatmentName = activeTreatment?.treatments?.name ?? 'No active treatment'
            const done = activeTreatment?.sittings_completed ?? 0
            const total = activeTreatment?.sittings_total ?? 0
            const progress = total > 0 ? Math.round((done / total) * 100) : 0
            const age = patient.date_of_birth
              ? Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / 3.15576e10)
              : null

            return (
              <div key={patient.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-start justify-between">
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
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{treatmentName}</p>
                    {activeTreatment && (
                      <p className="text-xs text-gray-400 mt-0.5">{done}/{total} sittings</p>
                    )}
                  </div>
                </div>
                {activeTreatment && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Treatment progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}