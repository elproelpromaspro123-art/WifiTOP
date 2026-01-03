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
      className="glow-border rounded-2xl p-8 md:p-10 mb-12 backdrop-blur-sm"
      id="ranking"
    >
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-5xl">🏆</span>
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-300 via-white to-yellow-200 bg-clip-text text-transparent">
                Ranking Global
              </h2>
            </div>
            <p className="text-gray-400 text-base flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span className="font-semibold">{totalResults.toLocaleString()}</span>
              usuarios compitiendo
            </p>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-xl p-6 border border-yellow-500/30 backdrop-blur-sm min-w-fit"
          >
            <p className="text-5xl font-black text-yellow-400 mb-2">📈</p>
            <p className="text-gray-300 text-xs font-semibold">Actualizado en tiempo real</p>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-80">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
            <p className="text-gray-400 font-semibold">Cargando ranking...</p>
          </motion.div>
        </div>
      ) : ranking.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/10"
        >
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-gray-400 text-lg font-semibold">No hay resultados aún</p>
          <p className="text-gray-500 mt-2">¡Sé el primero en probar tu velocidad!</p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gradient-to-r from-white/20 to-transparent">
                <th className="text-left py-4 px-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Posición</th>
                <th className="text-left py-4 px-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-right py-4 px-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Descarga</th>
                <th className="text-right py-4 px-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Subida</th>
                <th className="text-right py-4 px-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Ping</th>
                <th className="text-left py-4 px-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3) }}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  className="border-b border-white/5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {entry.rank <= 3 ? (
                        <motion.span
                          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-3xl drop-shadow-lg"
                        >
                          {getMedalEmoji(entry.rank)}
                        </motion.span>
                      ) : (
                        <motion.span
                          whileHover={{ scale: 1.2 }}
                          className="text-sm font-bold text-white w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/50 group-hover:to-purple-500/40 transition-all border border-blue-500/30"
                        >
                          #{entry.rank}
                        </motion.span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-white group-hover:text-blue-300 transition-colors truncate text-sm">{entry.userName}</span>
                  </td>
                  <td className={`py-4 px-4 text-right font-black text-lg ${getSpeedColor(entry.downloadSpeed)} group-hover:scale-110 transition-transform origin-right`}>
                    {formatSpeed(entry.downloadSpeed)}
                    <span className="text-xs text-gray-400 ml-1 font-semibold">Mbps</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-blue-400 font-bold group-hover:text-blue-300 transition-colors">{formatSpeed(entry.uploadSpeed)}</span>
                    <span className="text-xs text-gray-400 ml-1 font-semibold">Mbps</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`font-bold text-sm ${entry.ping < 20 ? 'text-green-400' : entry.ping < 50 ? 'text-yellow-400' : 'text-red-400'}`}
                    >
                      {entry.ping.toFixed(0)}
                    </motion.span>
                    <span className="text-xs text-gray-400 ml-1 font-semibold">ms</span>
                  </td>
                  <td className="py-4 px-4 text-gray-400 text-sm">
                    {entry.city && entry.country ? (
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg px-3 py-1 inline-block font-medium border border-blue-500/30 group-hover:border-blue-500/50 transition-all"
                      >
                        📍 {entry.city}
                      </motion.span>
                    ) : (
                      <span className="text-gray-500 font-semibold">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30 backdrop-blur-sm"
      >
        <p className="text-sm text-gray-300 text-center font-medium">
          <span className="text-blue-400 font-bold">💡 Tip:</span> El ranking se actualiza automáticamente cada hora. Los mejores 1000 resultados se muestran aquí.
        </p>
      </motion.div>
    </motion.div>
  )
}
