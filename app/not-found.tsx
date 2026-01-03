'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* 404 Animation */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-9xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl"
        >
          404
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glow-border rounded-2xl p-10 backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-blue-500/5"
        >
          <h1 className="text-4xl font-black mb-4 text-white">
            Página no encontrada
          </h1>

          <p className="text-gray-400 mb-4 text-lg leading-relaxed">
            Parece que la página que buscas no existe. Tal vez se haya mudado o eliminado.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 mb-8"
          >
            <span className="text-2xl">🚀</span>
            <p className="text-sm text-gray-400">
              Pero no te preocupes, aquí puedes volver al inicio
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              asChild
            >
              <Link
                href="/"
                className="flex-1 inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-lg font-bold transition-all duration-300 text-white shadow-lg shadow-blue-500/40"
              >
                ⚡ Volver al inicio
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              asChild
            >
              <Link
                href="#"
                className="flex-1 inline-block px-8 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg font-bold transition-all duration-300 text-white border border-purple-500/50"
              >
                📞 Contactar soporte
              </Link>
            </motion.div>
          </div>

          {/* Footer text */}
          <p className="text-xs text-gray-500 mt-8 border-t border-white/10 pt-6">
            Si crees que esto es un error, por favor contacta con nosotros
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
