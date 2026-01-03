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
        <div className="container mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <h1 className="text-6xl md:text-7xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                WifiTOP
              </span>
            </h1>
            <p className="text-2xl text-gray-300 font-semibold mb-2">Presume tu velocidad 🚀</p>
            <p className="text-lg text-gray-400">Compite con usuarios de todo el mundo 🏆</p>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 py-8">
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
                className="mt-6 glow-border rounded-lg p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/5"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-300">Velocidad Promedio Global</h3>
                <p className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {stats.avgSpeed.toFixed(2)}
                  <span className="text-xl text-gray-400 ml-3 font-semibold">Mbps</span>
                </p>
              </motion.div>
              
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 glow-border rounded-lg p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/5"
                >
                  <h3 className="text-lg font-semibold mb-6 text-gray-300">✅ Tu Resultado Actual</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="text-center bg-white/5 rounded-lg p-4 border border-blue-500/30"
                    >
                      <p className="text-gray-400 text-xs font-semibold mb-2">⬇️ Descarga</p>
                      <p className="text-3xl font-black text-blue-400">{results.downloadSpeed}</p>
                      <p className="text-gray-500 text-xs mt-1">Mbps</p>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center bg-white/5 rounded-lg p-4 border border-green-500/30"
                    >
                      <p className="text-gray-400 text-xs font-semibold mb-2">⬆️ Subida</p>
                      <p className="text-3xl font-black text-green-400">{results.uploadSpeed}</p>
                      <p className="text-gray-500 text-xs mt-1">Mbps</p>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center bg-white/5 rounded-lg p-4 border border-yellow-500/30"
                    >
                      <p className="text-gray-400 text-xs font-semibold mb-2">📡 Ping</p>
                      <p className="text-3xl font-black text-yellow-400">{results.ping}</p>
                      <p className="text-gray-500 text-xs mt-1">ms</p>
                    </motion.div>
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
      whileHover={{ scale: 1.02 }}
      className="glow-border rounded-lg p-6 hover:shadow-glow transition-all duration-300 bg-gradient-to-br from-white/5 to-white/0"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse"></div>
          ) : (
            <p className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{value}</p>
          )}
        </div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl ml-4"
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  )
}
