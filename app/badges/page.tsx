'use client'

import Link from 'next/link'
import { BADGES, Badge } from '@/lib/badges'

const rarityColors: Record<Badge['rarity'], { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'from-gray-500/20 to-gray-500/5',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    glow: ''
  },
  uncommon: {
    bg: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'hover:shadow-green-500/20'
  },
  rare: {
    bg: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'hover:shadow-blue-500/20'
  },
  epic: {
    bg: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'hover:shadow-purple-500/20'
  }
}

const rarityLabels: Record<Badge['rarity'], string> = {
  common: 'Común',
  uncommon: 'Poco Común',
  rare: 'Raro',
  epic: 'Épico'
}

const unlockRequirements: Record<string, string> = {
  speedster_extreme: 'Alcanza una velocidad de descarga superior a 500 Mbps',
  fiber_connection: 'Consigue un ping inferior a 5ms (típico de fibra óptica)',
  super_downloader: 'Alcanza una velocidad de descarga superior a 300 Mbps',
  upload_master: 'Alcanza una velocidad de subida superior a 100 Mbps',
  gaming_beast: 'Obtén ping menor a 10ms y descarga mayor a 50 Mbps',
  stability_king: 'Mantén una estabilidad de conexión superior al 95%',
  speed_demon: 'Alcanza una velocidad de descarga superior a 100 Mbps',
  balanced: 'Consigue descarga y subida mayores a 50 Mbps con ping menor a 30ms',
  top_1000: 'Entra en el top 1000 del ranking global',
  top_100: 'Entra en el top 100 del ranking global',
  low_latency: 'Consigue un jitter inferior a 2ms'
}

export default function BadgesPage() {
  const badges = Object.values(BADGES)

  const badgesByRarity = {
    epic: badges.filter(b => b.rarity === 'epic'),
    rare: badges.filter(b => b.rarity === 'rare'),
    uncommon: badges.filter(b => b.rarity === 'uncommon'),
    common: badges.filter(b => b.rarity === 'common')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Insignias
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Desbloquea insignias completando tests de velocidad y alcanzando hitos específicos. 
            ¡Demuestra la calidad de tu conexión!
          </p>
        </div>

        {/* Stats Summary */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-2xl font-bold text-white">{badges.length}</span>
            <span className="text-gray-400 ml-2">Insignias totales</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <span className="text-2xl font-bold text-purple-400">{badgesByRarity.epic.length}</span>
            <span className="text-gray-400 ml-2">Épicas</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <span className="text-2xl font-bold text-blue-400">{badgesByRarity.rare.length}</span>
            <span className="text-gray-400 ml-2">Raras</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
            <span className="text-2xl font-bold text-green-400">{badgesByRarity.uncommon.length}</span>
            <span className="text-gray-400 ml-2">Poco comunes</span>
          </div>
        </div>

        {/* Badges Grid by Rarity */}
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Epic Badges */}
          {badgesByRarity.epic.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                <h2 className="text-2xl font-bold text-purple-400">Insignias Épicas</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badgesByRarity.epic.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </section>
          )}

          {/* Rare Badges */}
          {badgesByRarity.rare.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <h2 className="text-2xl font-bold text-blue-400">Insignias Raras</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badgesByRarity.rare.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </section>
          )}

          {/* Uncommon Badges */}
          {badgesByRarity.uncommon.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <h2 className="text-2xl font-bold text-green-400">Insignias Poco Comunes</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badgesByRarity.uncommon.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </section>
          )}

          {/* Common Badges */}
          {badgesByRarity.common.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <h2 className="text-2xl font-bold text-gray-400">Insignias Comunes</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-500/50 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badgesByRarity.common.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">¿Listo para conseguir insignias?</h2>
            <p className="text-gray-400 mb-4">
              Realiza un test de velocidad y desbloquea las insignias que correspondan a tu conexión.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Iniciar Test
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  const colors = rarityColors[badge.rarity]
  
  return (
    <div 
      className={`
        relative bg-gradient-to-br ${colors.bg} border ${colors.border} 
        rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] 
        hover:shadow-xl ${colors.glow}
      `}
    >
      {/* Rarity Label */}
      <div className="absolute top-3 right-3">
        <span className={`text-xs font-medium ${colors.text} px-2 py-1 rounded-full bg-black/30`}>
          {rarityLabels[badge.rarity]}
        </span>
      </div>

      {/* Icon */}
      <div className="text-5xl mb-4">{badge.icon}</div>

      {/* Name */}
      <h3 className="text-lg font-bold text-white mb-1">{badge.name}</h3>

      {/* Short Description */}
      <p className="text-sm text-gray-400 mb-3">{badge.description}</p>

      {/* Unlock Requirement */}
      <div className="pt-3 border-t border-white/10">
        <p className="text-xs text-gray-500">
          <span className="text-gray-400 font-medium">Cómo desbloquear:</span>{' '}
          {unlockRequirements[badge.id]}
        </p>
      </div>
    </div>
  )
}
