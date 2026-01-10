'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SpeedTest from '@/components/SpeedTest'
import Results from '@/components/Results'
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
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="text-center py-12">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent mb-4">
            WifiTOP
          </h1>
          <p className="text-xl text-gray-300 mb-2">{t('app.subtitle')}</p>
          <p className="text-gray-500 max-w-lg mx-auto">{t('app.description')}</p>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <Stats />
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <SpeedTest onComplete={handleTestComplete} />
            {result && <Results result={result} />}
            {badges.length > 0 && <Badges unlockedBadges={badges} />}
          </div>

          <div>
            <Ranking />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
