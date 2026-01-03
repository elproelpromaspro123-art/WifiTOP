'use client'

import { useState } from 'react'
import SpeedTestCard from '@/components/SpeedTestCard'
import RankingTable from '@/components/RankingTable'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ValidationError from '@/components/ValidationError'
import { useStats } from '@/hooks/useStats'
import { motion } from 'framer-motion'

export default function Home() {
  const [results, setResults] = useState<any>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const { stats, loading, error, refetch } = useStats()

  const handleTestComplete = (result: any) => {
    setResults(result)
    // Actualizar stats después de completar test
    setTimeout(refetch, 1000)
  }

  // Mostrar error si cambia
  if (error && error !== statsError) {
    setStatsError(error)
  }

  return (
    <main className="min-h-screen bg-dark-bg overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        {/* Error Display */}
        {statsError && (
          <div className="container mx-auto px-4 mt-4">
            <ValidationError
              message={statsError}
              type="error"
              onClose={() => setStatsError(null)}
            />
          </div>
        )}
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-3">
              <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                WifiTOP
              </span>
            </h1>
            <p className="text-xl text-gray-400">Presume tu velocidad 🚀 | Compite globalmente 🏆</p>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* SpeedTest Card */}
            <div className="lg:col-span-1">
              <SpeedTestCard onTestComplete={handleTestComplete} />
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard 
                  title="Pruebas Completadas"
                  value={stats.total.toLocaleString()}
                  icon="📊"
                  loading={loading}
                />
                <StatsCard 
                  title="Velocidad Máxima"
                  value={`${stats.maxSpeed.toFixed(2)} Mbps`}
                  icon="⚡"
                  loading={loading}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 glow-border rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Velocidad Promedio</h3>
                <p className="text-4xl font-bold">
                  {stats.avgSpeed.toFixed(2)}
                  <span className="text-lg text-gray-400 ml-2">Mbps</span>
                </p>
              </motion.div>
              
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 glow-border rounded-lg p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Tu Resultado</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Descarga</p>
                      <p className="text-2xl font-bold">{results.downloadSpeed} Mbps</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Subida</p>
                      <p className="text-2xl font-bold">{results.uploadSpeed} Mbps</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Ping</p>
                      <p className="text-2xl font-bold">{results.ping} ms</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Ranking Table */}
          <RankingTable />
        </div>

        <Footer />
      </div>
    </main>
  )
}

interface StatsCardProps {
  title: string
  value: string
  icon: string
  loading?: boolean
}

function StatsCard({ title, value, icon, loading = false }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glow-border rounded-lg p-6 hover:shadow-glow transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{value}</p>
          )}
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </motion.div>
  )
}
