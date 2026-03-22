import { supabase } from '@/lib/supabase'
import StaffSidebar from '../components/Sidebar'

export default async function AnalyticsPage() {
  // Revenue by month
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status, created_at')
    .eq('status', 'paid')
    .order('created_at')

  // Treatments performance
  const { data: treatments } = await supabase
    .from('treatments')
    .select(`
      id, name, category, price_per_sitting,
      patient_treatments (
        id, status, sittings_completed, sittings_total
      )
    `)

  // Patient growth
  const { data: patients } = await supabase
    .from('patients')
    .select('id, created_at')
    .order('created_at')

  // Appointments stats
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, status, scheduled_at')
    .order('scheduled_at')

  // Calculate monthly revenue
  const monthlyRevenue: Record<string, number> = {}
  payments?.forEach(p => {
    const month = new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + Number(p.amount)
  })

  // Calculate patient growth by month
  const patientGrowth: Record<string, number> = {}
  patients?.forEach(p => {
    const month = new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    patientGrowth[month] = (patientGrowth[month] ?? 0) + 1
  })

  // Treatment stats
  const treatmentStats = treatments?.map(t => {
    const total = t.patient_treatments?.length ?? 0
    const active = t.patient_treatments?.filter((pt: any) => pt.status === 'active').length ?? 0
    const completed = t.patient_treatments?.filter((pt: any) => pt.status === 'completed').length ?? 0
    const revenue = t.patient_treatments?.reduce((sum: number, pt: any) =>
      sum + (pt.sittings_completed * Number(t.price_per_sitting ?? 0)), 0) ?? 0
    return { name: t.name, category: t.category, total, active, completed, revenue }
  }) ?? []

  // Appointment completion rate
  const totalApts = appointments?.length ?? 0
  const completedApts = appointments?.filter(a => a.status === 'completed').length ?? 0
  const cancelledApts = appointments?.filter(a => a.status === 'cancelled').length ?? 0
  const noshowApts = appointments?.filter(a => a.status === 'noshow').length ?? 0
  const scheduledApts = appointments?.filter(a => a.status === 'scheduled').length ?? 0
  const completionRate = totalApts > 0 ? Math.round((completedApts / totalApts) * 100) : 0

  // Total revenue
  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  const maxRevenue = Math.max(...Object.values(monthlyRevenue), 1)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <StaffSidebar active="Analytics" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-gray-400 mb-8">Clinic performance overview</p>

        {/* Top stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-green-400' },
            { label: 'Total patients', value: patients?.length ?? 0, color: '' },
            { label: 'Completion rate', value: `${completionRate}%`, color: 'text-blue-400' },
            { label: 'Total appointments', value: totalApts, color: '' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold text-lg mb-6">Monthly Revenue</h3>
            {Object.keys(monthlyRevenue).length === 0 ? (
              <p className="text-gray-500 text-sm">No revenue data yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(monthlyRevenue).map(([month, amount]) => (
                  <div key={month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{month}</span>
                      <span className="text-white font-medium">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(amount / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointment Status Breakdown */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold text-lg mb-6">Appointment Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Completed', value: completedApts, color: 'bg-green-500', text: 'text-green-400' },
                { label: 'Scheduled', value: scheduledApts, color: 'bg-blue-500', text: 'text-blue-400' },
                { label: 'Cancelled', value: cancelledApts, color: 'bg-red-500', text: 'text-red-400' },
                { label: 'No-show', value: noshowApts, color: 'bg-yellow-500', text: 'text-yellow-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{item.label}</span>
                    <span className={`font-medium ${item.text}`}>{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: totalApts > 0 ? `${(item.value / totalApts) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Treatment Performance */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Treatment Performance</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left pb-3 font-medium">Treatment</th>
                <th className="text-left pb-3 font-medium">Category</th>
                <th className="text-left pb-3 font-medium">Total Patients</th>
                <th className="text-left pb-3 font-medium">Active</th>
                <th className="text-left pb-3 font-medium">Completed</th>
                <th className="text-left pb-3 font-medium">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {treatmentStats.map((t) => (
                <tr key={t.name} className="hover:bg-gray-800 transition-colors">
                  <td className="py-3 font-medium">{t.name}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      t.category === 'hair' ? 'bg-purple-900 text-purple-300' :
                      t.category === 'skin' ? 'bg-pink-900 text-pink-300' :
                      t.category === 'prp' ? 'bg-blue-900 text-blue-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3 text-gray-300">{t.total}</td>
                  <td className="py-3 text-green-400">{t.active}</td>
                  <td className="py-3 text-blue-400">{t.completed}</td>
                  <td className="py-3 text-white font-medium">₹{t.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Patient Growth */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-lg mb-6">Patient Growth</h3>
          {Object.keys(patientGrowth).length === 0 ? (
            <p className="text-gray-500 text-sm">No patient data yet</p>
          ) : (
            <div className="flex items-end gap-4 h-32">
              {Object.entries(patientGrowth).map(([month, count]) => {
                const maxCount = Math.max(...Object.values(patientGrowth))
                const height = Math.max((count / maxCount) * 100, 10)
                return (
                  <div key={month} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs text-gray-400">{count}</span>
                    <div
                      className="w-full bg-blue-600 rounded-t-lg transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-500 text-center">{month}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
