'use client'

import { motion } from 'framer-motion'
import { useBadges } from '@/hooks/useBadges'
import { getBadgeInfo } from '@/lib/badges'

export default function UserBadgesDisplay() {
  const { getAllBadges, getBadgeStats, isLoading } = useBadges()

  const badges = getAllBadges()
  const stats = getBadgeStats()

  if (isLoading) {
    return null
  }

  if (badges.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glow-border rounded-xl p-6 bg-gradient-to-br from-purple-500/15 to-pink-500/10 mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black text-white mb-1">
            🏅 Tus Badges Desbloqueados
          </h3>
          <p className="text-sm text-gray-400">
            Total: <span className="font-bold text-purple-300">{stats.total}</span>
            {' | '} Épicos: <span className="font-bold text-yellow-300">{stats.byRarity.epic}</span>
            {' | '} Raros: <span className="font-bold text-cyan-300">{stats.byRarity.rare}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges.map(badge => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-br ${badge.info?.color} rounded-lg p-3 text-center border border-white/20 hover:border-white/40 transition-all cursor-pointer group`}
            title={badge.info?.description}
          >
            <p className="text-2xl mb-2">{badge.info?.icon}</p>
            <p className="text-xs font-bold text-white leading-tight mb-1">
              {badge.info?.name}
            </p>
            <p className="text-xs text-white/70 group-hover:text-white/100 transition-colors">
              {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Rareza visual */}
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-300">Épicos: {stats.byRarity.epic}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span className="text-gray-300">Raros: {stats.byRarity.rare}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-300">Poco Comunes: {stats.byRarity.uncommon}</span>
        </div>
      </div>
    </motion.div>
  )
}
