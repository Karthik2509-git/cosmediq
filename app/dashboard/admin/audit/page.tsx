import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'

export default async function AuditPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const actionColors: Record<string, string> = {
    APPOINTMENT_COMPLETED: 'bg-green-900 text-green-300',
    APPOINTMENT_CANCELLED: 'bg-red-900 text-red-300',
    APPOINTMENT_NOSHOW: 'bg-yellow-900 text-yellow-300',
    PAYMENT_RECORDED: 'bg-blue-900 text-blue-300',
    TREATMENT_ASSIGNED: 'bg-purple-900 text-purple-300',
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Cosmediq" width={120} height={40} className="object-contain" />
          <span className="text-xs text-red-400 border-l border-gray-700 pl-3 font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="text-sm text-gray-400 hover:text-white">← Admin Dashboard</Link>
          <SignOutButton>
            <button className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>

      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-2">Audit Trail</h2>
        <p className="text-gray-400 mb-8">System activity log — last 100 actions</p>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {logs && logs.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left px-6 py-4 font-medium">Action</th>
                  <th className="text-left px-6 py-4 font-medium">Entity</th>
                  <th className="text-left px-6 py-4 font-medium">Details</th>
                  <th className="text-left px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${actionColors[log.action] ?? 'bg-gray-700 text-gray-300'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 capitalize">{log.entity.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {log.details ? JSON.stringify(log.details).slice(0, 60) + '...' : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No activity logged yet.</p>
              <p className="text-gray-600 text-xs mt-1">Actions will appear here as staff use the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}