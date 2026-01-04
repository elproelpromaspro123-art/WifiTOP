'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WhatsNewModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  const features = [
    {
      icon: '🚀',
      title: 'Speedtest Preciso con Cloudflare',
      description: 'Mediciones ultra precisas de velocidad descarga, subida y latencia usando servidores de Cloudflare globales.'
    },
    {
      icon: '🏆',
      title: 'Ranking Global Expandido',
      description: 'Compite con los mejores. Top 10,000 usuarios en el ranking mundial actualizado en tiempo real.'
    },
    {
      icon: '🛡️',
      title: 'Detección de Fraude Inteligente',
      description: 'Sistema automático que detecta y rechaza resultados sospechosos para mantener la integridad del ranking.'
    },
    {
      icon: '🌍',
      title: 'Geolocalización Automática',
      description: 'Identifica automáticamente tu país e ISP para estadísticas globales precisas.'
    },
    {
      icon: '🏅',
      title: '12+ Badges Desbloqueables',
      description: 'Desbloquea badges exclusivos según tus logros: Speedster Extremo, Gaming Beast, Stability King y más.'
    },
    {
      icon: '🌐',
      title: 'Soporte Multiidioma',
      description: 'Interfaz disponible en 5 idiomas: Español, Inglés, Chino, Hindi y Francés. Se detecta automáticamente según tu navegador.'
    },
    {
      icon: '⚡',
      title: 'Protección Contra Abuso',
      description: 'Limitaciones inteligentes para garantizar que el servicio sea justo para todos los usuarios. Prueba sin límites cuando eres honesto.'
    },
    {
      icon: '📱',
      title: 'Modo Anónimo Disponible',
      description: 'Prueba tu velocidad sin aparecer en el ranking. Los datos no se guardan.'
    },
    {
      icon: '💾',
      title: 'Histórico Local',
      description: 'Guarda automáticamente tu histórico de pruebas en localStorage.'
    },
    {
      icon: '🔗',
      title: 'Compartir en Redes Sociales',
      description: 'Crea links para compartir tus resultados en Twitter y Facebook.'
    },
    {
      icon: '✅',
      title: 'Validación de Nombres Mejorada',
      description: 'Protección contra nombres ofensivos y maliciosos. Máximo 30 caracteres para mantener un ambiente respetable.'
    },
    {
      icon: '🔒',
      title: 'Seguridad Reforzada',
      description: 'Headers de seguridad modernos y protecciones contra ataques comunes. Tu experiencia es segura de principio a fin.'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl backdrop-blur-xl bg-gradient-to-br from-black/95 to-slate-950/95 border border-white/20 shadow-2xl shadow-blue-500/20 pointer-events-auto">
              {/* Header */}
              <div className="sticky top-0 p-6 border-b border-white/10 bg-gradient-to-r from-black/50 to-transparent">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">✨</span>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent">
                        Novedades
                      </h2>
                      <p className="text-sm text-gray-400">Todo lo que ofrece WifiTOP</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="text-2xl text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </motion.button>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + idx * 0.03 }}
                    className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300"
                  >
                    <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-bold text-white mb-1">{feature.title}</h3>
                      <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 p-6 border-t border-white/10 bg-gradient-to-r from-transparent to-black/50 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-300"
                >
                  Entendido, Vamos
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
