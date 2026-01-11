'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useRanking } from '@/hooks/useRanking'

export default function Ranking() {
  const { t } = useLanguage()
  const { ranking, totalResults, loading } = useRanking()

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-r from-white/5 via-white/[0.02] to-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('ranking.title')}</h2>
              <p className="text-sm text-gray-400">Top velocidades mundiales</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-300 font-medium">{totalResults.toLocaleString()} users</span>
          </div>
        </div>
      </div>

      <div className="relative p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="h-16 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl opacity-50">📊</span>
            </div>
            <p className="text-gray-400 font-medium">No hay resultados aún</p>
            <p className="text-gray-500 text-sm mt-1">Sé el primero en realizar un test</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-4 px-3 font-semibold">#</th>
                  <th className="pb-4 px-3 font-semibold">{t('ranking.user')}</th>
                  <th className="pb-4 px-3 font-semibold">{t('test.download')}</th>
                  <th className="pb-4 px-3 font-semibold">{t('test.upload')}</th>
                  <th className="pb-4 px-3 font-semibold">{t('test.ping')}</th>
                  <th className="pb-4 px-3 font-semibold">{t('ranking.location')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ranking.slice(0, 20).map((entry, i) => (
                  <tr 
                    key={entry.id} 
                    className={`group transition-all duration-300 hover:bg-white/5 ${
                      i < 3 ? 'bg-gradient-to-r from-white/[0.03] to-transparent' : ''
                    }`}
                  >
                    <td className="py-4 px-3">
                      {i === 0 ? (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                          <span className="text-sm">🥇</span>
                        </div>
                      ) : i === 1 ? (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/25">
                          <span className="text-sm">🥈</span>
                        </div>
                      ) : i === 2 ? (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-500/25">
                          <span className="text-sm">🥉</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                          <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/10">
                          <span className="text-sm font-bold text-purple-400">
                            {entry.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {entry.userName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-bold">{entry.downloadSpeed.toFixed(1)}</span>
                        <span className="text-gray-500 text-xs">Mbps</span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-bold">{entry.uploadSpeed.toFixed(1)}</span>
                        <span className="text-gray-500 text-xs">Mbps</span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">{entry.ping.toFixed(0)}</span>
                        <span className="text-gray-500 text-xs">ms</span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-gray-400 text-sm group-hover:bg-white/10 transition-colors">
                        <span className="text-xs">🌍</span>
                        {entry.country || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {ranking.length > 0 && (
        <div className="relative px-6 py-4 border-t border-white/5 bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02]">
          <p className="text-center text-sm text-gray-500">
            Mostrando top 20 de {totalResults.toLocaleString()} usuarios
          </p>
        </div>
      )}
    </div>
  )
}
