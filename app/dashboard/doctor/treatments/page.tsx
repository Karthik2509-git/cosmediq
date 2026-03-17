import { supabase } from '@/lib/supabase'
import DoctorSidebar from '../components/Sidebar'
import AddTreatmentButton from './AddTreatmentButton'
import EditTreatmentButton from './EditTreatmentButton'

export default async function DoctorTreatments() {
  const { data: treatments } = await supabase
    .from('treatments')
    .select(`
      id,
      name,
      category,
      description,
      total_sittings,
      price_per_sitting,
      patient_treatments (
        id,
        status,
        sittings_completed,
        sittings_total
      )
    `)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <DoctorSidebar active="Treatments" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Treatments</h2>
          <AddTreatmentButton />
        </div>
        <p className="text-gray-400 mb-8">{treatments?.length ?? 0} treatments offered</p>

        <div className="grid grid-cols-3 gap-4">
          {treatments?.map((t) => {
            const total = t.patient_treatments?.length ?? 0
            const active = t.patient_treatments?.filter((pt: any) => pt.status === 'active').length ?? 0
            const completed = t.patient_treatments?.filter((pt: any) => pt.status === 'completed').length ?? 0
            const avgProgress = total > 0
              ? Math.round(
                  (t.patient_treatments?.reduce((sum: number, pt: any) =>
                    sum + (pt.sittings_completed / pt.sittings_total) * 100, 0) ?? 0) / total
                )
              : 0

            const categoryColor: Record<string, string> = {
              hair: 'bg-purple-900 text-purple-300',
              skin: 'bg-pink-900 text-pink-300',
              prp: 'bg-blue-900 text-blue-300',
              laser: 'bg-yellow-900 text-yellow-300',
            }
            const colorClass = categoryColor[t.category?.toLowerCase()] ?? 'bg-gray-700 text-gray-300'

            return (
              <div key={t.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{t.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${colorClass}`}>
                      {t.category}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {t.price_per_sitting && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">per sitting</p>
                        <p className="text-lg font-bold text-white">₹{Number(t.price_per_sitting).toLocaleString('en-IN')}</p>
                      </div>
                    )}
                    <EditTreatmentButton treatment={{
                      id: t.id,
                      name: t.name,
                      category: t.category,
                      description: t.description,
                      total_sittings: t.total_sittings,
                      price_per_sitting: t.price_per_sitting,
                    }} />
                  </div>
                </div>

                {t.description && (
                  <p className="text-sm text-gray-400 mb-4">{t.description}</p>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{t.total_sittings}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Sittings</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-green-400">{active}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Active</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-blue-400">{completed}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Completed</p>
                  </div>
                </div>

                {total > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Avg progress across {total} patient{total > 1 ? 's' : ''}</span>
                      <span>{avgProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${avgProgress}%` }} />
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