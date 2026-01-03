'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface TestResult {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
}

interface SpeedTestCardProps {
  onTestComplete?: (result: TestResult) => void
}

export default function SpeedTestCard({ onTestComplete }: SpeedTestCardProps) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [userName, setUserName] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Listo')

  const getInternetRating = (speed: number) => {
    if (speed >= 500) return { score: 10, label: 'Excepcional', color: 'text-green-400', emoji: '🔥' }
    if (speed >= 300) return { score: 9, label: 'Excelente', color: 'text-green-400', emoji: '⭐' }
    if (speed >= 100) return { score: 8, label: 'Muy Bueno', color: 'text-blue-400', emoji: '✨' }
    if (speed >= 50) return { score: 7, label: 'Bueno', color: 'text-yellow-400', emoji: '👍' }
    if (speed >= 20) return { score: 5, label: 'Regular', color: 'text-orange-400', emoji: '📊' }
    return { score: 3, label: 'Lento', color: 'text-red-400', emoji: '⚠️' }
  }

  const getUseCaseQuality = (speed: number) => {
    const useCases = []
    if (speed >= 500) useCases.push({ name: '8K Streaming', icon: '📺', supported: true })
    if (speed >= 100) useCases.push({ name: '4K Streaming', icon: '🎬', supported: true })
    if (speed >= 50) useCases.push({ name: 'Gaming Online', icon: '🎮', supported: true })
    if (speed >= 20) useCases.push({ name: 'HD Streaming', icon: '📹', supported: true })
    if (speed >= 5) useCases.push({ name: 'Video Llamadas', icon: '📱', supported: true })
    useCases.push({ name: 'Navegación', icon: '🌐', supported: speed >= 1 })
    return useCases.slice(0, 5)
  }

  const handleStartTest = async () => {
    if (!userName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }

    setTesting(true)
    setProgress(0)
    setStatus('Iniciando prueba...')

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 30
        })
      }, 500)

      // Realizar prueba de velocidad
      const response = await fetch('/api/speedtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName }),
      })

      const data = await response.json()
      clearInterval(progressInterval)
      setProgress(100)
      setStatus('Completado')

      setResult(data.result)
      if (onTestComplete) {
        onTestComplete(data.result)
      }

      // Mostrar resultado por 5 segundos antes de permitir otra prueba
      setTimeout(() => {
        setTesting(false)
        setProgress(0)
        setStatus('Listo')
      }, 5000)
    } catch (error) {
      console.error('Error en prueba:', error)
      setStatus('Error en la prueba')
      setTesting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glow-border rounded-lg p-8 backdrop-blur-sm"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Prueba tu WiFi</h2>
        <p className="text-gray-400 text-sm mb-6">
          Descubre la velocidad real de tu conexión
        </p>

        {!result ? (
          <>
            {/* Input para nombre */}
            <input
              type="text"
              placeholder="Tu nombre"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={testing}
              className="w-full px-4 py-3 rounded-lg mb-6 disabled:opacity-50"
            />

            {/* Estado de prueba */}
            {testing && (
              <div className="mb-6">
                <div className="mb-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">{status}</span>
                    <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-white/50 to-white/80"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botón de prueba */}
            <button
              onClick={handleStartTest}
              disabled={testing}
              className="w-full py-4 rounded-lg font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 glow-border mb-4"
            >
              {testing ? 'Analizando...' : 'Comenzar Prueba'}
            </button>

            <p className="text-xs text-gray-400">
              La prueba toma aproximadamente 5 segundos
            </p>
          </>
        ) : (
          <>
            {/* Resultados Impactantes */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -20 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="mb-8"
            >
              {/* Rating Principal */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block"
                >
                  <div className="text-6xl mb-2">{getInternetRating(result.downloadSpeed).emoji}</div>
                </motion.div>
                <p className={`text-5xl font-bold ${getInternetRating(result.downloadSpeed).color} mb-1`}>
                  {getInternetRating(result.downloadSpeed).score}/10
                </p>
                <p className={`text-xl ${getInternetRating(result.downloadSpeed).color} font-semibold`}>
                  {getInternetRating(result.downloadSpeed).label}
                </p>
              </div>

              {/* Velocidad Descarga Principal */}
              <div className="glow-border rounded-lg p-6 mb-6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative text-center">
                  <p className="text-gray-400 text-sm mb-2">Velocidad de Descarga</p>
                  <p className="text-7xl font-black gradient-animate">
                    {result.downloadSpeed.toFixed(1)}
                  </p>
                  <p className="text-gray-300 text-lg font-semibold">Mbps</p>
                </div>
              </div>

              {/* Velocidad Subida y Ping */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glow-border rounded-lg p-4"
                >
                  <p className="text-gray-400 text-xs mb-1">Subida</p>
                  <p className="text-4xl font-bold text-blue-400">{result.uploadSpeed.toFixed(1)}</p>
                  <p className="text-gray-400 text-xs">Mbps</p>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glow-border rounded-lg p-4"
                >
                  <p className="text-gray-400 text-xs mb-1">Ping</p>
                  <p className={`text-4xl font-bold ${result.ping < 20 ? 'text-green-400' : result.ping < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {result.ping.toFixed(0)}
                  </p>
                  <p className="text-gray-400 text-xs">ms</p>
                </motion.div>
              </div>

              {/* Casos de Uso */}
              <div className="mb-6">
                <p className="text-gray-400 text-xs mb-2 font-semibold">OPTIMIZADO PARA:</p>
                <div className="grid grid-cols-2 gap-2">
                  {getUseCaseQuality(result.downloadSpeed).map((useCase, idx) => (
                    <motion.div
                      key={useCase.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 rounded-lg p-2 text-center border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all"
                    >
                      <div className="text-2xl mb-1">{useCase.icon}</div>
                      <p className="text-xs font-semibold text-gray-300">{useCase.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Info Adicional */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-3 mb-6 border border-white/10"
              >
                <p className="text-xs text-gray-400 text-center">
                  <span className="text-green-400 font-semibold">Tu conexión es perfecta</span> para la mayoría de actividades en línea
                </p>
              </motion.div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setResult(null)
                setUserName('')
              }}
              className="w-full py-4 rounded-lg font-semibold bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 transition-all duration-300 glow-border"
            >
              🔄 Nuevamente
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  )
}
