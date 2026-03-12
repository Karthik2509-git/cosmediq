import { SignOutButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function DoctorDashboard() {
  const { sessionClaims } = await auth()
  const name = (sessionClaims?.metadata as any)?.name || 'Doctor'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Cosmediq</h1>
          <p className="text-xs text-gray-500">Doctor Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Dr. Karthik</span>
          <SignOutButton>
            <button className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Good morning, Dr. Karthik</h2>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today's appointments", value: '8' },
            { label: 'Active patients', value: '24' },
            { label: 'Pending treatments', value: '6' },
            { label: 'Completed today', value: '3' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-lg mb-4">Today's appointments</h3>
          <div className="space-y-3">
            {[
              { name: 'Rahul Sharma', time: '09:00 AM', treatment: 'Hair Transplant - Sitting 3/8', status: 'Confirmed' },
              { name: 'Priya Menon', time: '10:30 AM', treatment: 'Laser Skin - Sitting 1/6', status: 'Confirmed' },
              { name: 'Arun Kumar', time: '12:00 PM', treatment: 'PRP Therapy - Sitting 2/4', status: 'Pending' },
              { name: 'Sneha Reddy', time: '02:00 PM', treatment: 'Hair Transplant - Sitting 5/8', status: 'Confirmed' },
            ].map((apt) => (
              <div key={apt.name} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                    {apt.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{apt.name}</p>
                    <p className="text-sm text-gray-400">{apt.treatment}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{apt.time}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    apt.status === 'Confirmed' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}