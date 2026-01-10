'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { getAllBadges, BADGES } from '@/lib/badges'

interface Props {
  unlockedBadges: string[]
}

export default function Badges({ unlockedBadges }: Props) {
  const { t } = useLanguage()
  const allBadges = getAllBadges()

  if (unlockedBadges.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6 text-center">
        <p className="text-gray-400">{t('badges.none')}</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">{t('badges.title')}</h3>

      <div className="flex flex-wrap gap-3">
        {unlockedBadges.map((badgeId) => {
          const badge = BADGES[badgeId]
          if (!badge) return null

          return (
            <div
              key={badgeId}
              className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2"
              title={badge.description}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="text-sm font-medium">{badge.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
