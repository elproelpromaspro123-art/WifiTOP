'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="glow-border rounded-lg p-8 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
        <p className="text-gray-400 mb-6">{error.message || 'Ocurrió un error inesperado'}</p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
