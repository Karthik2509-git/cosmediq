import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'

export default async function DashboardPage() {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role

  if (role === 'doctor') redirect('/dashboard/doctor')
  if (role === 'patient') redirect('/dashboard/patient')
  if (role === 'staff') redirect('/dashboard/staff')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Welcome to Cosmediq</h1>
        <p className="text-gray-400 mt-2">Your account is pending role assignment.</p>
        <p className="text-gray-500 mt-1 text-sm">Current role: {role || 'none'}</p>
        <SignOutButton>
          <button className="mt-6 px-4 py-2 bg-white text-black rounded-lg">
            Sign out and retry
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}