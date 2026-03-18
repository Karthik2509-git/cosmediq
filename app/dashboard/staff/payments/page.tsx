import { supabase } from '@/lib/supabase'
import StaffSidebar from '../components/Sidebar'
import RecordPaymentButton from './RecordPaymentButton'
import PaymentActions from './PaymentActions'

export default async function StaffPayments() {
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id, amount, status, method, paid_at, created_at,
      patients ( users ( full_name ) ),
      appointments (
        scheduled_at,
        patient_treatments ( treatments ( name ) )
      )
    `)
    .order('created_at', { ascending: false })

  const { data: patients } = await supabase
    .from('patients')
    .select('id, users ( full_name, email )')

  const total = payments?.reduce((sum, p) => sum + (p.status === 'paid' ? Number(p.amount) : 0), 0) ?? 0
  const pending = payments?.filter(p => p.status === 'pending').length ?? 0
  const paid = payments?.filter(p => p.status === 'paid').length ?? 0

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <StaffSidebar active="Payments" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Payments</h2>
          <RecordPaymentButton patients={patients ?? []} />
        </div>
        <p className="text-gray-400 mb-8">Billing and payment management</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Total collected</p>
            <p className="text-3xl font-bold mt-1">₹{total.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Paid</p>
            <p className="text-3xl font-bold mt-1 text-green-400">{paid}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">{pending}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {payments && payments.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left px-6 py-4 font-medium">Patient</th>
                  <th className="text-left px-6 py-4 font-medium">Treatment</th>
                  <th className="text-left px-6 py-4 font-medium">Amount</th>
                  <th className="text-left px-6 py-4 font-medium">Method</th>
                  <th className="text-left px-6 py-4 font-medium">Date</th>
                  <th className="text-left px-6 py-4 font-medium">Status</th>
                  <th className="text-left px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {payments.map((payment) => {
                  const name = (payment.patients as any)?.users?.full_name ?? 'Unknown'
                  const treatment = (payment.appointments as any)?.patient_treatments?.treatments?.name ?? '—'
                  const date = new Date(payment.created_at)
                  return (
                    <tr key={payment.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 font-medium">{name}</td>
                      <td className="px-6 py-4 text-gray-300">{treatment}</td>
                      <td className="px-6 py-4 font-medium">₹{Number(payment.amount).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-gray-400 capitalize">{payment.method ?? '-'}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'paid' ? 'bg-green-900 text-green-300' :
                          payment.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <PaymentActions
                          paymentId={payment.id}
                          currentStatus={payment.status}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No payments recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}