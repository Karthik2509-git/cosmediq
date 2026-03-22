export default function ErrorBanner({ message }: { message: string }) {
    return (
      <div className="bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-300 mb-6">
        ⚠️ {message}
      </div>
    )
  }