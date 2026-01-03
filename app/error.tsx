'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 glow-border rounded-2xl p-10 text-center max-w-lg backdrop-blur-sm bg-gradient-to-br from-red-500/10 to-orange-500/5"
      >
        {/* Error Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl mb-6 inline-block drop-shadow-xl"
        >
          ⚠️
        </motion.div>

        <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          Algo salió mal
        </h2>
        
        <p className="text-gray-400 mb-2 text-base leading-relaxed">
          {error.message || 'Ocurrió un error inesperado en la aplicación'}
        </p>
        
        {error.digest && (
          <p className="text-gray-500 text-xs mb-6 font-mono bg-white/5 rounded-lg p-3 border border-white/10">
            Error ID: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 flex-col sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 rounded-lg font-semibold transition-all duration-300 text-white shadow-lg shadow-orange-500/30"
          >
            🔄 Intentar de nuevo
          </motion.button>

          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 rounded-lg font-semibold transition-all duration-300 text-white border border-blue-500/50 flex items-center justify-center gap-2"
          >
            🏠 Volver al inicio
          </motion.a>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-500 mt-8 border-t border-white/10 pt-6">
          Si el problema persiste, intenta refrescar la página o contacta con soporte
        </p>
      </motion.div>
    </div>
  )
}
