'use client'

import { motion } from 'framer-motion'
import { useTestHistory } from '@/hooks/useTestHistory'
import { useLanguage } from '@/hooks/useLanguage'


export default function TestHistoryDisplay() {
  const { history, getStats, isLoading, clearHistory, totalTests } = useTestHistory()
  const { t } = useLanguage()

  const stats = getStats()

  if (isLoading || totalTests === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glow-border rounded-xl p-6 md:p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 mb-12 relative z-10"
    >
      <div className="mb-8">
         <h3 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center gap-3">
           📊 {t('history.title')}
         </h3>
         <p className="text-sm md:text-base text-gray-400">
           {totalTests} {t('history.tests_registered')}
         </p>
       </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <p className="text-xs text-cyan-300 font-semibold mb-2">{t('history.average')}</p>
            <p className="text-2xl md:text-3xl font-black text-cyan-400">
              {stats.avgDownload.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Mbps</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg p-4 border border-green-500/30 hover:border-green-500/60 transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            <p className="text-xs text-green-300 font-semibold mb-2">{t('history.maximum')}</p>
            <p className="text-2xl md:text-3xl font-black text-green-400">
              {stats.maxDownload.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Mbps</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-lg p-4 border border-orange-500/30 hover:border-orange-500/60 transition-all hover:shadow-lg hover:shadow-orange-500/20"
          >
            <p className="text-xs text-orange-300 font-semibold mb-2">{t('history.minimum')}</p>
            <p className="text-2xl md:text-3xl font-black text-orange-400">
              {stats.minDownload.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Mbps</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg p-4 border border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <p className="text-xs text-purple-300 font-semibold mb-2">{t('history.trend')}</p>
            <p className="text-3xl font-black">
              {stats.trend === 'up' ? '📈' : stats.trend === 'down' ? '📉' : '➡️'}
            </p>
            <p className="text-xs text-gray-500 capitalize mt-1 font-semibold">{stats.trend}</p>
          </motion.div>
        </div>
      )}

      {/* Latest tests */}
      <div className="space-y-3 mb-6">
        <p className="text-sm md:text-base font-bold text-gray-200">{t('history.latest_tests')}</p>
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

      {/* Clear button */}
      <button
        onClick={clearHistory}
        className="w-full py-2 rounded-lg text-sm font-semibold bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer pointer-events-auto relative z-10"
      >
        {t('history.clear')}
      </button>
    </motion.div>
  )
}
