'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useRanking } from '@/hooks/useRanking'

export default function Ranking() {
  const { t } = useLanguage()
  const { ranking, totalResults, loading } = useRanking()

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('ranking.title')}</h2>
        <span className="text-sm text-gray-400">{totalResults.toLocaleString()} users</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : ranking.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No results yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-white/10">
                <th className="pb-3 px-2">#</th>
                <th className="pb-3 px-2">{t('ranking.user')}</th>
                <th className="pb-3 px-2">{t('test.download')}</th>
                <th className="pb-3 px-2">{t('test.upload')}</th>
                <th className="pb-3 px-2">{t('test.ping')}</th>
                <th className="pb-3 px-2">{t('ranking.location')}</th>
              </tr>
            </thead>
            <tbody>
              {ranking.slice(0, 20).map((entry, i) => (
                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 px-2 font-bold">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="py-3 px-2 font-medium">{entry.userName}</td>
                  <td className="py-3 px-2 text-blue-400">{entry.downloadSpeed.toFixed(1)} Mbps</td>
                  <td className="py-3 px-2 text-green-400">{entry.uploadSpeed.toFixed(1)} Mbps</td>
                  <td className="py-3 px-2 text-yellow-400">{entry.ping.toFixed(0)} ms</td>
                  <td className="py-3 px-2 text-gray-400 text-sm">{entry.country || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
