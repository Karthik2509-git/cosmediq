'use client'
import { useState } from 'react'
import { Download, Loader } from 'lucide-react'

export default function BackupButtons() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleBackup(type: string) {
    setLoading(type)
    try {
      const res = await fetch(`/api/admin/backup?type=${type}`)
      const data = await res.json()

      if (data.error) {
        alert('Backup failed: ' + data.error)
        return
      }

      const XLSX = await import('xlsx')
      const ws = XLSX.utils.json_to_sheet(data.records)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, type)
      XLSX.writeFile(wb, `cosmediq_${type}_backup_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`)
    } catch (err) {
      alert('Backup failed')
    }
    setLoading(null)
  }

  const backups = [
    { type: 'patients', label: 'Export Patients' },
    { type: 'appointments', label: 'Export Appointments' },
    { type: 'payments', label: 'Export Payments' },
    { type: 'audit_logs', label: 'Export Audit Logs' },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {backups.map(b => (
        <button key={b.type} onClick={() => handleBackup(b.type)}
          disabled={loading === b.type}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm transition-colors disabled:opacity-50">
          {loading === b.type ? <Loader size={15} className="animate-spin" /> : <Download size={15} />}
          {b.label}
        </button>
      ))}
    </div>
  )
}