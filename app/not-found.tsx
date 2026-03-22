import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-700 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-gray-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/dashboard"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors">
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}