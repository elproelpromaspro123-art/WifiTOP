'use client'

import { motion } from 'framer-motion'
import { useBadges } from '@/hooks/useBadges'
import { getBadgeInfo, getAllBadges as getAllAvailableBadges } from '@/lib/badges'
import { useLanguage } from '@/hooks/useLanguage'

export default function UserBadgesDisplay() {
  const { getAllBadges, getBadgeStats, isLoading } = useBadges()
  const { t } = useLanguage()

  const badges = getAllBadges()
  const stats = getBadgeStats()
  const allAvailableBadges = getAllAvailableBadges()

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glow-border rounded-xl p-8 bg-gradient-to-br from-purple-500/15 to-pink-500/10 mb-12"
      >
        <div className="flex items-center justify-center h-40">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="loading-spinner w-12 h-12 mx-auto mb-3"></div>
             <p className="text-gray-400 font-semibold">{t('badges.loading')}</p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glow-border rounded-xl p-8 bg-gradient-to-br from-purple-500/15 to-pink-500/10 mb-12"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center gap-3">
            🏅 {t('badges.unlocked')}
          </h3>
          <p className="text-sm md:text-base text-gray-400">
            <span>{t('badges.total')}: <span className="font-bold text-purple-300">{stats.total}/{allAvailableBadges.length}</span></span>
            {stats.total > 0 && (
              <>
                {' | '} <span>{t('badges.epic')}: <span className="font-bold text-yellow-300">{stats.byRarity.epic}</span></span>
                {' | '} <span>{t('badges.rare')}: <span className="font-bold text-cyan-300">{stats.byRarity.rare}</span></span>
              </>
            )}
          </p>
        </div>
        {stats.total > 0 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl md:text-5xl"
          >
            ✨
          </motion.div>
        )}
      </div>

      {badges.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {badges.map(badge => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.08, y: -5 }}
                className={`bg-gradient-to-br ${badge.info?.color} rounded-lg p-4 text-center border-2 border-white/30 hover:border-white/60 transition-all cursor-pointer group shadow-lg hover:shadow-xl`}
                title={badge.info?.description}
              >
                <p className="text-3xl md:text-4xl mb-2 group-hover:scale-125 transition-transform origin-center">
                  {badge.info?.icon}
                </p>
                <p className="text-xs font-bold text-white leading-tight mb-2 line-clamp-2">
                   {badge.info?.name ? t(badge.info.name) : 'Unknown'}
                 </p>
                <p className="text-xs text-white/80 group-hover:text-white transition-colors">
                  {new Date(badge.unlockedAt).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Rareza visual */}
          <div className="pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
            >
              <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{t('badges.epic')}</p>
                <p className="text-lg font-bold text-yellow-300">{stats.byRarity.epic}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
            >
              <div className="w-3 h-3 rounded-full bg-cyan-500 flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{t('badges.rare')}</p>
                <p className="text-lg font-bold text-cyan-300">{stats.byRarity.rare}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
            >
              <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{t('badges.uncommon')}</p>
                <p className="text-lg font-bold text-purple-300">{stats.byRarity.uncommon}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
            >
              <div className="w-3 h-3 rounded-full bg-gray-500 flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{t('badges.common')}</p>
                <p className="text-lg font-bold text-gray-300">{stats.byRarity.common}</p>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <p className="text-5xl mb-4">🔓</p>
          <p className="text-xl font-bold text-white mb-2">{t('badges.none')}</p>
          <p className="text-gray-400 mb-6">{t('badges.none_desc')}</p>
          
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-sm font-semibold text-gray-300 mb-4">{t('badges.available')} ({allAvailableBadges.length}):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allAvailableBadges.map(badge => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-3 text-center border border-white/20 opacity-60 hover:opacity-100 transition-all"
                  title={badge.description}
                >
                  <p className="text-3xl mb-2">{badge.icon}</p>
                  <p className="text-xs font-semibold text-gray-300 leading-tight mb-1">
                    {badge.name}
                  </p>
                  <p className={`text-xs font-bold ${
                    badge.rarity === 'epic' ? 'text-yellow-300' :
                    badge.rarity === 'rare' ? 'text-cyan-300' :
                    badge.rarity === 'uncommon' ? 'text-purple-300' :
                    'text-gray-400'
                  }`}>
                    {badge.rarity.toUpperCase()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
