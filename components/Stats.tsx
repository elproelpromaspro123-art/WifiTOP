'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useStats } from '@/hooks/useStats'

export default function Stats() {
  const { t } = useLanguage()
  const { stats, loading } = useStats()

  const items = [
    { 
      label: t('stats.tests'), 
      value: stats.total.toLocaleString(), 
      icon: '📊',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/30',
      shadowColor: 'shadow-blue-500/20',
      iconBg: 'from-blue-500/30 to-cyan-500/30'
    },
    { 
      label: t('stats.maxSpeed'), 
      value: `${stats.maxSpeed.toFixed(1)} Mbps`, 
      icon: '⚡',
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-500/20 via-yellow-500/10 to-transparent',
      borderColor: 'border-yellow-500/30',
      shadowColor: 'shadow-yellow-500/20',
      iconBg: 'from-yellow-500/30 to-orange-500/30'
    },
    { 
      label: t('stats.avgSpeed'), 
      value: `${stats.avgSpeed.toFixed(1)} Mbps`, 
      icon: '📈',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/20 via-green-500/10 to-transparent',
      borderColor: 'border-green-500/30',
      shadowColor: 'shadow-green-500/20',
      iconBg: 'from-green-500/30 to-emerald-500/30'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((item, i) => (
        <div
          key={i}
          className={`group relative bg-gradient-to-br from-slate-900 via-gray-900 to-black 
                     border ${item.borderColor} rounded-2xl p-6 overflow-hidden
                     hover:scale-[1.02] hover:${item.shadowColor} hover:shadow-xl
                     transition-all duration-300 cursor-default`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {item.label}
              </p>
              {loading ? (
                <div className="h-10 w-28 bg-white/10 rounded-lg animate-pulse" />
              ) : (
                <p className={`text-4xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                  {item.value}
                </p>
              )}
            </div>
            
            <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${item.iconBg} 
                           flex items-center justify-center border border-white/10
                           group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              <span className="text-3xl">{item.icon}</span>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
            </div>
          </div>
          
          <div className="relative mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500">En tiempo real</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
