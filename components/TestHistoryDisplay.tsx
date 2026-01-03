'use client'

import { motion } from 'framer-motion'
import { useTestHistory } from '@/hooks/useTestHistory'

export default function TestHistoryDisplay() {
  const { history, getStats, isLoading, clearHistory, totalTests } = useTestHistory()

  const stats = getStats()

  if (isLoading || totalTests === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glow-border rounded-xl p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 mb-12"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-black text-white mb-2">
          📊 Histórico de Pruebas
        </h3>
        <p className="text-sm text-gray-400">
          {totalTests} pruebas registradas localmente
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Promedio</p>
            <p className="text-2xl font-black text-cyan-400">
              {stats.avgDownload.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Mbps</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Máximo</p>
            <p className="text-2xl font-black text-green-400">
              {stats.maxDownload.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Mbps</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Mínimo</p>
            <p className="text-2xl font-black text-orange-400">
              {stats.minDownload.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Mbps</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Tendencia</p>
            <p className="text-2xl font-black">
              {stats.trend === 'up' ? '📈' : stats.trend === 'down' ? '📉' : '➡️'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{stats.trend}</p>
          </div>
        </div>
      )}

      {/* Últimas pruebas */}
      <div className="space-y-2 mb-4">
        <p className="text-sm font-semibold text-gray-300">Últimas pruebas:</p>
        <div className="space-y-2">
          {history.slice(0, 5).map((test, idx) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="text-sm">
                <p className="font-semibold text-white">
                  {test.downloadSpeed.toFixed(1)} Mbps
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(test.timestamp).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="text-gray-400">
                  📡 {test.ping.toFixed(0)}ms
                </p>
                <p className="text-gray-500">
                  ⬆️ {test.uploadSpeed.toFixed(1)} Mbps
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Botón limpiar */}
      <button
        onClick={clearHistory}
        className="w-full py-2 rounded-lg text-sm font-semibold bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all"
      >
        🗑️ Limpiar histórico
      </button>
    </motion.div>
  )
}
