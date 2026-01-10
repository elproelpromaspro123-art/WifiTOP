'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
      <p className="text-gray-400 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
