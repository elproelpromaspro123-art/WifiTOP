'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SpeedTest from '@/components/SpeedTest'
import Stats from '@/components/Stats'
import Ranking from '@/components/Ranking'
import Badges from '@/components/Badges'
import { useLanguage } from '@/hooks/useLanguage'
import { SpeedTestResult } from '@/lib/speedtest'
import { unlockBadges } from '@/lib/badges'

export default function Home() {
  const { t, isLoaded } = useLanguage()
  const [result, setResult] = useState<SpeedTestResult | null>(null)
  const [badges, setBadges] = useState<string[]>([])

  const handleTestComplete = (testResult: SpeedTestResult) => {
    setResult(testResult)
    const unlockedBadges = unlockBadges(
      testResult.downloadSpeed,
      testResult.uploadSpeed,
      testResult.ping,
      testResult.jitter,
      testResult.stability
    )
    setBadges(unlockedBadges)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="text-center py-12 md:py-16">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent mb-4">
            WifiTOP
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">{t('app.subtitle')}</p>
          <p className="text-gray-500 max-w-2xl mx-auto">{t('app.description')}</p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Conexiones Paralelas', 'Chunks Adaptativos', 'Anti-Fraude', '5 Idiomas'].map((feature, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                ✓ {feature}
              </span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <Stats />
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-12">
          {/* Speed Test - Columna principal */}
          <div className="xl:col-span-3 space-y-6">
            <SpeedTest onComplete={handleTestComplete} />
            
            {/* Badges (solo si hay) */}
            {badges.length > 0 && (
              <Badges unlockedBadges={badges} />
            )}
          </div>

          {/* Ranking - Columna lateral */}
          <div className="xl:col-span-2">
            <Ranking />
          </div>
        </section>

        {/* Información técnica */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">¿Cómo funciona?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-3xl">📡</span>
                </div>
                <h3 className="font-bold text-white mb-2">1. Medición de Ping</h3>
                <p className="text-sm text-gray-400">
                  20 muestras con warmup y descarte de outliers (percentil 10-90) para máxima precisión.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-3xl">⬇️</span>
                </div>
                <h3 className="font-bold text-white mb-2">2. Test de Descarga</h3>
                <p className="text-sm text-gray-400">
                  6 conexiones paralelas con chunks adaptativos (100KB-25MB) durante 15 segundos para saturar tu ancho de banda.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-3xl">⬆️</span>
                </div>
                <h3 className="font-bold text-white mb-2">3. Test de Subida</h3>
                <p className="text-sm text-gray-400">
                  4 conexiones paralelas optimizadas para upload, validando coherencia con la velocidad de descarga.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-center text-gray-500 text-sm">
                Powered by <span className="text-blue-400">Cloudflare Speed</span> • 
                Detección automática de tipo de conexión (Fibra, Cable, DSL, Móvil) • 
                Sistema anti-fraude integrado
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
