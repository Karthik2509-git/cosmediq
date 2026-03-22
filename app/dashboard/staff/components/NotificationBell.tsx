'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell, X } from 'lucide-react'
import Link from 'next/link'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  async function fetchNotifications() {
    setLoading(true)
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.notifications ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-900 text-yellow-300',
    blue: 'bg-blue-900 text-blue-300',
    red: 'bg-red-900 text-red-300',
    green: 'bg-green-900 text-green-300',
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)}>
              <X size={16} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications</div>
          ) : (
            <div className="divide-y divide-gray-800 max-h-80 overflow-auto">
              {notifications.map((n) => (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-800 transition-colors">
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-0.5 shrink-0 ${colorMap[n.color] ?? 'bg-gray-700 text-gray-300'}`}>
                    {n.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-gray-800">
            <button onClick={fetchNotifications}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Refresh notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}