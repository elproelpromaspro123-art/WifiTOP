'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface AdminStats {
  stats: {
    totalTests: number
    avgDownload: string
    avgUpload: string
    avgPing: string
    maxDownload: string
    maxUpload: string
    minPing: string
  }
  topUsers: Array<{
    name: string
    download: string
    upload: string
    ping: string
    date: string
  }>
  countryStats: Array<{
    country: string
    tests: number
    avgSpeed: string
    maxSpeed: string
  }>
  last24h: number
  successRate: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/analytics')
        ])

        if (statsRes.status === 403 || analyticsRes.status === 403) {
          setAccessDenied(true)
          return
        }

        const statsData = await statsRes.json()
        const analyticsData = await analyticsRes.json()

        if (!statsData.success) {
          setError(statsData.error || 'Error al cargar estadísticas')
          return
        }

        setStats(statsData)
        setAnalytics(analyticsData)
      } catch (err) {
        setError('Error al conectar con el servidor de administración')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-black text-red-500 mb-4">Acceso Denegado</h1>
          <p className="text-gray-400">IP no autorizada para acceder al panel de administración.</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            🛡️ Panel de Administración
          </h1>
          <p className="text-gray-400">Estadísticas y análisis de la plataforma WifiTOP</p>
        </motion.div>

        {loading && (
          <div className="text-center py-20">
            <div className="loading-spinner w-16 h-16 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando datos de administración...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8 text-red-300">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glow-border rounded-lg p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/0"
              >
                <p className="text-gray-400 text-sm font-semibold mb-2">Total de Pruebas</p>
                <p className="text-4xl font-black text-blue-400">{stats.stats.totalTests.toLocaleString()}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glow-border rounded-lg p-6 bg-gradient-to-br from-green-500/10 to-green-500/0"
              >
                <p className="text-gray-400 text-sm font-semibold mb-2">Descarga Promedio</p>
                <p className="text-4xl font-black text-green-400">{stats.stats.avgDownload} Mbps</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glow-border rounded-lg p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/0"
              >
                <p className="text-gray-400 text-sm font-semibold mb-2">Subida Promedio</p>
                <p className="text-4xl font-black text-purple-400">{stats.stats.avgUpload} Mbps</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glow-border rounded-lg p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-500/0"
              >
                <p className="text-gray-400 text-sm font-semibold mb-2">Ping Promedio</p>
                <p className="text-4xl font-black text-cyan-400">{stats.stats.avgPing} ms</p>
              </motion.div>
            </div>

            {/* Top Usuarios */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glow-border rounded-lg p-8 mb-12 bg-gradient-to-br from-white/5 to-white/0"
            >
              <h2 className="text-2xl font-black text-white mb-6">🏆 Top 10 Usuarios</h2>
              <div className="space-y-3">
                {stats.topUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/50 transition-all"
                  >
                    <div>
                      <p className="font-bold text-white">{idx + 1}. {user.name}</p>
                      <p className="text-xs text-gray-500">{new Date(user.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-400">{user.download} Mbps</p>
                      <p className="text-xs text-gray-400">⬇️ {user.upload} Mbps | 📡 {user.ping} ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Estadísticas por país */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glow-border rounded-lg p-8 bg-gradient-to-br from-white/5 to-white/0"
            >
              <h2 className="text-2xl font-black text-white mb-6">🌍 Estadísticas por País</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-bold text-sm">País</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-bold text-sm">Pruebas</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-bold text-sm">Vel. Promedio</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-bold text-sm">Vel. Máxima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.countryStats.map((country, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="py-3 px-4 text-white font-semibold">{country.country}</td>
                        <td className="py-3 px-4 text-right text-gray-300">{country.tests}</td>
                        <td className="py-3 px-4 text-right text-green-400 font-bold">{country.avgSpeed} Mbps</td>
                        <td className="py-3 px-4 text-right text-blue-400 font-bold">{country.maxSpeed} Mbps</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Métricas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="glow-border rounded-lg p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/0"
              >
                <p className="text-gray-400 text-sm font-semibold mb-2">Últimas 24 Horas</p>
                <p className="text-4xl font-black text-yellow-400">{stats.last24h}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="glow-border rounded-lg p-6 bg-gradient-to-br from-red-500/10 to-red-500/0"
              >
                <p className="text-gray-400 text-sm font-semibold mb-2">Tasa de Éxito</p>
                <p className="text-4xl font-black text-red-400">{stats.successRate}%</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="glow-border rounded-lg p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/0"
              >
                <p className="text-gray-400 text-sm font-semibold mb-2">Vel. Máxima Registrada</p>
                <p className="text-4xl font-black text-emerald-400">{stats.stats.maxDownload} Mbps</p>
              </motion.div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}
