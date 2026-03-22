'use client'
import { useState, useRef } from 'react'
import { Upload, X, FileText, Image } from 'lucide-react'

export default function FileUpload({ patientId, onUpload }: {
  patientId: string
  onUpload: () => void
}) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('before-after')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('patient_id', patientId)
    formData.append('category', category)

    const res = await fetch('/api/patient/upload-file', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()

    if (data.success) {
      setMessage('✅ File uploaded successfully!')
      setFile(null)
      setTimeout(() => {
        setOpen(false)
        setMessage('')
        onUpload()
      }, 1500)
    } else {
      setMessage('❌ ' + data.error)
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm transition-colors">
        <Upload size={15} />
        Upload File
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Upload Patient File</h3>
              <button onClick={() => { setOpen(false); setFile(null); setMessage('') }}>
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="before-after">Before/After Photo</option>
                  <option value="report">Medical Report</option>
                  <option value="prescription">Prescription</option>
                  <option value="consent">Consent Form</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">File</label>
                <div
                  onClick={() => inputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors">
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      {file.type.startsWith('image/') ? (
                        <Image size={20} className="text-blue-400" />
                      ) : (
                        <FileText size={20} className="text-blue-400" />
                      )}
                      <span className="text-sm text-white">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} className="mx-auto text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400">Click to select file</p>
                      <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP, PDF — max 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {message && <p className="text-sm">{message}</p>}

              <div className="flex gap-3">
                <button onClick={() => { setOpen(false); setFile(null); setMessage('') }}
                  className="flex-1 border border-gray-700 text-gray-400 hover:text-white rounded-lg px-4 py-2.5 text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleUpload} disabled={!file || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors">
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}