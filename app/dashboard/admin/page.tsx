import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const { count: totalPatients } = await supabase
    .from('patients').select('*', { count: 'exact', head: true })

  const { count: totalDoctors } = await supabase
    .from('doctors').select('*', { count: 'exact', head: true })

  const { count: totalAppointments } = await supabase
    .from('appointments').select('*', { count: 'exact', head: true })

  const { count: totalBranches } = await supabase
    .from('branches').select('*', { count: 'exact', head: true })

  const { data: payments } = await supabase
    .from('payments').select('amount, status')

  const totalRevenue = payments?.reduce((sum, p) =>
    sum + (p.status === 'paid' ? Number(p.amount) : 0), 0) ?? 0

  const { count: activeTreatments } = await supabase
    .from('patient_treatments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Cosmediq" width={120} height={40} className="object-contain" />
          <span className="text-xs text-red-400 border-l border-gray-700 pl-3 font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full">Super Admin</span>
          <SignOutButton>
            <button className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>

      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-gray-400 mb-8">Full system overview and control</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total patients', value: totalPatients ?? 0 },
            { label: 'Total doctors', value: totalDoctors ?? 0 },
            { label: 'Total branches', value: totalBranches ?? 0 },
            { label: 'Total appointments', value: totalAppointments ?? 0 },
            { label: 'Active treatments', value: activeTreatments ?? 0 },
            { label: 'Total revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick access to all portals */}
        <h3 className="font-semibold text-lg mb-4">Quick Access</h3>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Doctor Portal', href: '/dashboard/doctor', desc: 'View as doctor', color: 'border-blue-800 hover:border-blue-600' },
            { label: 'Staff Portal', href: '/dashboard/staff', desc: 'View as staff', color: 'border-purple-800 hover:border-purple-600' },
            { label: 'Analytics', href: '/dashboard/staff/analytics', desc: 'Revenue & performance', color: 'border-green-800 hover:border-green-600' },
            { label: 'User Management', href: '/dashboard/staff/users', desc: 'Assign roles', color: 'border-yellow-800 hover:border-yellow-600' },
            { label: 'Payments', href: '/dashboard/staff/payments', desc: 'Billing overview', color: 'border-pink-800 hover:border-pink-600' },
            { label: 'Manage', href: '/dashboard/staff/manage', desc: 'Add patients, doctors', color: 'border-orange-800 hover:border-orange-600' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className={`bg-gray-900 rounded-xl p-5 border ${item.color} transition-colors`}>
              <p className="font-semibold text-white">{item.label}</p>
              <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* System info */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-lg mb-4">System Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Platform</p>
              <p className="text-white">Cosmediq v1.0 — Phase 1</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Database</p>
              <p className="text-white">Supabase PostgreSQL</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Authentication</p>
              <p className="text-white">Clerk (Development Mode)</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Deployment</p>
              <p className="text-white">Vercel — cosmediq.vercel.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}