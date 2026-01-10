'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useStats } from '@/hooks/useStats'

export default function Stats() {
  const { t } = useLanguage()
  const { stats, loading } = useStats()

  const items = [
    { label: t('stats.tests'), value: stats.total.toLocaleString(), icon: '📊' },
    { label: t('stats.maxSpeed'), value: `${stats.maxSpeed.toFixed(1)} Mbps`, icon: '⚡' },
    { label: t('stats.avgSpeed'), value: `${stats.avgSpeed.toFixed(1)} Mbps`, icon: '📈' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">{item.label}</p>
              {loading ? (
                <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold">{item.value}</p>
              )}
            </div>
            <span className="text-4xl opacity-40">{item.icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
