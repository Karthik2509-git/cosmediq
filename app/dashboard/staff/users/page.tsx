'use client'
import { useState, useEffect } from 'react'
import StaffSidebar from '../components/Sidebar'

const ROLES = ['patient', 'doctor', 'staff']

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'doctor' | 'staff' | 'patient'>('all')

  async function fetchUsers() {
    setFetching(true)
    const res = await fetch('/api/admin/pending-users')
    const data = await res.json()
    setUsers(data.users ?? [])
    setFetching(false)
  }

  useEffect(() => { fetchUsers() }, [])

  async function assignRole(clerk_id: string, role: string) {
    setUpdating(clerk_id)
    setMessage('')
    const res = await fetch('/api/admin/assign-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerk_id, role }),
    })
    const data = await res.json()
    if (data.success) {
      setMessage('✅ Role assigned successfully!')
      fetchUsers()
    } else {
      setMessage('❌ ' + data.error)
    }
    setUpdating(null)
  }

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true
    if (filter === 'pending') return !u.role
    return u.role === filter
  })

  const pendingCount = users.filter(u => !u.role).length

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <StaffSidebar active="Users" />

      <div className="flex-1 px-8 py-8 overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">User Management</h2>
          {pendingCount > 0 && (
            <span className="bg-yellow-900 text-yellow-300 text-xs px-3 py-1 rounded-full">
              {pendingCount} pending role assignment
            </span>
          )}
        </div>
        <p className="text-gray-400 mb-6">Assign roles to users who have signed up</p>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {(['all', 'pending', 'doctor', 'staff', 'patient'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                filter === f ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {f === 'pending' ? `Pending (${pendingCount})` : f}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-sm">
            {message}
          </div>
        )}

        {fetching ? (
          <p className="text-gray-400 text-sm">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left px-6 py-4 font-medium">User</th>
                  <th className="text-left px-6 py-4 font-medium">Email</th>
                  <th className="text-left px-6 py-4 font-medium">Current Role</th>
                  <th className="text-left px-6 py-4 font-medium">Joined</th>
                  <th className="text-left px-6 py-4 font-medium">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user.clerk_id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image_url ? (
                          <img src={user.image_url} alt={user.full_name}
                            className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                            {user.full_name[0]}
                          </div>
                        )}
                        <span className="font-medium">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.role ? (
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          user.role === 'doctor' ? 'bg-blue-900 text-blue-300' :
                          user.role === 'staff' ? 'bg-purple-900 text-purple-300' :
                          'bg-green-900 text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-900 text-yellow-300">
                          pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {ROLES.map(role => (
                          <button key={role} onClick={() => assignRole(user.clerk_id, role)}
                            disabled={updating === user.clerk_id || user.role === role}
                            className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors disabled:opacity-40 ${
                              user.role === role
                                ? 'bg-gray-700 text-gray-300 cursor-default'
                                : 'border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                            }`}>
                            {updating === user.clerk_id ? '...' : role}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}