'use client'

import { motion } from 'framer-motion'
import { useRanking } from '@/hooks/useRanking'
import { getMedalEmoji, getSpeedColor, formatSpeed } from '@/lib/utils'

interface RankingEntry {
  id: number
  rank: number
  userName: string
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  city?: string
  country?: string
  createdAt: string
}

export default function RankingTable() {
  const { ranking, loading, totalResults } = useRanking()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glow-border rounded-lg p-8 mb-12"
      id="ranking"
    >
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              🏆 Ranking Global
            </h2>
            <p className="text-gray-400 text-base flex items-center gap-2">
              <span className="text-2xl">👥</span>
              {totalResults.toLocaleString()} usuarios probando su velocidad
            </p>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-right bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20"
          >
            <p className="text-4xl font-black text-yellow-400">📈</p>
            <p className="text-gray-400 text-xs mt-2">Actualizado en tiempo real</p>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner w-12 h-12"></div>
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No hay resultados aún. ¡Sé el primero en probar!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Posición</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Usuario</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Descarga</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Subida</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Ping</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  className="border-b border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {entry.rank <= 3 ? (
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-2xl"
                        >
                          {getMedalEmoji(entry.rank)}
                        </motion.span>
                      ) : (
                        <span className="text-lg font-bold text-gray-400 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          {entry.rank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-white truncate">{entry.userName}</span>
                  </td>
                  <td className={`py-4 px-4 text-right font-bold text-lg ${getSpeedColor(entry.downloadSpeed)}`}>
                    {formatSpeed(entry.downloadSpeed)}
                    <span className="text-xs text-gray-400 ml-1">Mbps</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-blue-400 font-semibold">{formatSpeed(entry.uploadSpeed)}</span>
                    <span className="text-xs text-gray-400 ml-1">Mbps</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold ${entry.ping < 20 ? 'text-green-400' : entry.ping < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {entry.ping.toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">ms</span>
                  </td>
                  <td className="py-4 px-4 text-gray-400 text-sm">
                    {entry.city && entry.country ? (
                      <span className="bg-white/5 rounded px-2 py-1">{entry.city}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-sm text-gray-400 text-center">
          El ranking se actualiza automáticamente. Solo se mantienen los 1000 mejores resultados.
        </p>
      </div>
    </motion.div>
  )
}
