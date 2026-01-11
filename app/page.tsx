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
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 animate-pulse">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      <Header />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-300">Test de velocidad profesional</span>
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                WifiTOP
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-3xl text-gray-300 mb-3 font-light">
              {t('app.subtitle')}
            </p>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              {t('app.description')}
            </p>

            {/* CTA Button */}
            <div className="mt-8">
              <a
                href="#test"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Iniciar Test
              </a>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {[
                { icon: '🔗', text: 'Conexiones Paralelas' },
                { icon: '📊', text: 'Chunks Adaptativos' },
                { icon: '🛡️', text: 'Anti-Fraude' },
                { icon: '🌍', text: '5 Idiomas' },
                { icon: '⏱️', text: '30 Segundos' },
              ].map((feature, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-default"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="mr-2">{feature.icon}</span>
                  {feature.text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Stats />
        </section>

        {/* Main Content */}
        <section id="test" className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-16">
          {/* Speed Test - Main Column */}
          <div className="xl:col-span-3 space-y-6">
            <SpeedTest onComplete={handleTestComplete} />
            
            {/* Badges (only if unlocked) */}
            {badges.length > 0 && (
              <div className="animate-fade-in-up">
                <Badges unlockedBadges={badges} />
              </div>
            )}
          </div>

          {/* Ranking - Sidebar */}
          <div id="ranking" className="xl:col-span-2">
            <Ranking />
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="mb-16">
          <div className="relative bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />

            <div className="relative">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-4">
                  Tecnología Avanzada
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Cómo funciona?</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Nuestro test utiliza tecnología de punta para medir tu conexión en solo 30 segundos con máxima precisión.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="group text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">📡</span>
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 text-black font-bold text-sm flex items-center justify-center">1</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3">Medición de Ping</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    20 muestras con warmup y descarte de outliers (percentil 10-90) para máxima precisión.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="group text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">⬇️</span>
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm flex items-center justify-center">2</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3">Test de Descarga</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    6 conexiones paralelas con chunks adaptativos (100KB-25MB) durante 12 segundos para saturar tu ancho de banda.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="group text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">⬆️</span>
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm flex items-center justify-center">3</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3">Test de Subida</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    4 conexiones paralelas optimizadas para upload, validando coherencia con la velocidad de descarga.
                  </p>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-12 pt-8 border-t border-white/5">
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    Powered by <span className="text-blue-400 font-medium">Cloudflare</span>
                  </div>
                  <div className="w-px h-4 bg-white/10 hidden md:block" />
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    Detección automática de conexión
                  </div>
                  <div className="w-px h-4 bg-white/10 hidden md:block" />
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Sistema anti-fraude integrado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
