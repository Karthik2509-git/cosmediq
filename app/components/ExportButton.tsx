'use client'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  data: any[]
  filename: string
  label?: string
}

export default function ExportButton({ data, filename, label = 'Export Excel' }: ExportButtonProps) {
  async function handleExport() {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`)
  }

  return (
    <button onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm transition-colors">
      <Download size={15} />
      {label}
    </button>
  )
}