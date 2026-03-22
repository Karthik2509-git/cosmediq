export default function EmptyState({ message, sub }: { message: string, sub?: string }) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
        <p className="text-gray-400 font-medium">{message}</p>
        {sub && <p className="text-gray-600 text-sm mt-1">{sub}</p>}
      </div>
    )
  }