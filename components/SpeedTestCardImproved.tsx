'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { simulateSpeedTestImproved } from '@/lib/speedtest-improved'
import ValidationError from './ValidationError'

interface TestResult {
    downloadSpeed: number
    uploadSpeed: number
    ping: number
    jitter: number
    minDownload?: number
    maxDownload?: number
    minUpload?: number
    maxUpload?: number
    minPing?: number
    maxPing?: number
    stability?: number
}

interface SpeedTestCardProps {
    onTestComplete?: (result: TestResult) => void
}

interface TestPhase {
    name: 'idle' | 'ping' | 'download' | 'upload' | 'complete'
    label: string
    icon: string
    color: string
}

const PHASES: Record<string, TestPhase> = {
    idle: { name: 'idle', label: 'Listo', icon: '⚡', color: 'text-gray-400' },
    ping: { name: 'ping', label: 'Midiendo Ping', icon: '📡', color: 'text-yellow-400' },
    download: { name: 'download', label: 'Descargando', icon: '⬇️', color: 'text-blue-400' },
    upload: { name: 'upload', label: 'Subiendo', icon: '⬆️', color: 'text-green-400' },
    complete: { name: 'complete', label: 'Completado', icon: '✅', color: 'text-emerald-400' }
}

export default function SpeedTestCardImproved({ onTestComplete }: SpeedTestCardProps) {
    const [testing, setTesting] = useState(false)
    const [result, setResult] = useState<TestResult | null>(null)
    const [userName, setUserName] = useState('')
    const [progress, setProgress] = useState(0)
    const [currentPhase, setCurrentPhase] = useState<TestPhase>(PHASES.idle)
    const [statusMsg, setStatusMsg] = useState('Listo')
    const [error, setError] = useState<string | null>(null)
    const [testDetails, setTestDetails] = useState({
        currentSpeed: 0,
        phase: 'idle' as 'ping' | 'download' | 'upload'
    })

    const handleStartTest = async () => {
        setError(null)

        if (!userName.trim()) {
            setError('Por favor ingresa tu nombre')
            return
        }

        if (userName.trim().length < 2) {
            setError('El nombre debe tener al menos 2 caracteres')
            return
        }

        setTesting(true)
        setProgress(0)
        setCurrentPhase(PHASES.ping)
        setStatusMsg('Iniciando prueba...')
        setTestDetails({ currentSpeed: 0, phase: 'ping' })

        try {
            const testResult = await simulateSpeedTestImproved((progress, status, details) => {
                setProgress(progress)
                setStatusMsg(status)

                if (details?.phase) {
                    setCurrentPhase(PHASES[details.phase])
                    setTestDetails({
                        currentSpeed: details.currentSpeed || 0,
                        phase: details.phase
                    })
                }
            })

            setProgress(98)
            setStatusMsg('Guardando resultado...')

            const response = await fetch('/api/speedtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, testResult }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.error || 'Error al procesar la prueba')
                setTesting(false)
                return
            }

            const data = await response.json()

            if (!data.success || !data.result) {
                setError(data.error || 'Error desconocido')
                setTesting(false)
                return
            }

            setProgress(100)
            setCurrentPhase(PHASES.complete)
            setStatusMsg('Prueba completada')
            setResult(data.result)

            if (onTestComplete) {
                onTestComplete(data.result)
            }

            setTimeout(() => {
                setTesting(false)
                setProgress(0)
                setCurrentPhase(PHASES.idle)
                setStatusMsg('Listo')
                setTestDetails({ currentSpeed: 0, phase: 'ping' })
            }, 5000)

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error en prueba:', error)
            setError(errorMsg)
            setTesting(false)
        }
    }

    const getInternetRating = (speed: number) => {
        if (speed >= 500) return { score: 10, label: 'Excepcional', color: 'text-green-400', emoji: '🔥' }
        if (speed >= 300) return { score: 9, label: 'Excelente', color: 'text-green-400', emoji: '⭐' }
        if (speed >= 100) return { score: 8, label: 'Muy Bueno', color: 'text-blue-400', emoji: '✨' }
        if (speed >= 50) return { score: 7, label: 'Bueno', color: 'text-yellow-400', emoji: '👍' }
        if (speed >= 20) return { score: 5, label: 'Regular', color: 'text-orange-400', emoji: '📊' }
        return { score: 3, label: 'Lento', color: 'text-red-400', emoji: '⚠️' }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glow-border rounded-lg p-8 backdrop-blur-sm bg-gradient-to-br from-white/5 to-white/0"
        >
            <div className="text-center">
                {!result ? (
                    <>
                        <div className="mb-6">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="inline-block text-5xl mb-3"
                            >
                                {currentPhase.icon}
                            </motion.div>
                            <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                                Prueba tu WiFi
                            </h2>
                        </div>

                        <ValidationError message={error} type="error" onClose={() => setError(null)} />

                        {!testing ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg mb-6 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />

                                <button
                                    onClick={handleStartTest}
                                    className="w-full py-4 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-white mb-4"
                                >
                                    🚀 Comenzar Prueba
                                </button>

                                <p className="text-xs text-gray-400">
                                    La prueba durará aprox. 2-3 minutos para máxima precisión (260MB de datos)
                                </p>
                            </>
                        ) : (
                            <div className="space-y-8">
                                {/* Estado actual */}
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${currentPhase.color} mb-2`}>
                                        {currentPhase.label}
                                    </p>
                                    <p className="text-gray-400 text-sm">{statusMsg}</p>
                                </div>

                                {/* Barra de progreso */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Progreso</span>
                                        <span className="font-bold text-blue-400">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/20">
                                        <motion.div
                                            animate={{ width: `${progress}%` }}
                                            transition={{ type: 'spring', stiffness: 100 }}
                                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 shadow-lg shadow-blue-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Métricas en tiempo real */}
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Ping */}
                                    <motion.div
                                        animate={{
                                            scale: currentPhase.name === 'ping' ? [1, 1.08, 1] : 1,
                                            opacity: currentPhase.name === 'ping' ? 1 : 0.6
                                        }}
                                        transition={{ duration: 0.4 }}
                                        className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/15 to-transparent border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                                    >
                                        <p className="text-2xl mb-2">📡</p>
                                        <p className="text-xs text-gray-400 mb-3 font-semibold">PING</p>
                                        <motion.p
                                            key={`ping-${testDetails.currentSpeed}`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-3xl font-black text-yellow-400"
                                        >
                                            {currentPhase.name === 'ping' && testDetails.currentSpeed > 0
                                                ? testDetails.currentSpeed.toFixed(0)
                                                : '--'}
                                        </motion.p>
                                        <p className="text-xs text-gray-500 mt-1">ms</p>
                                    </motion.div>

                                    {/* Descarga */}
                                    <motion.div
                                        animate={{
                                            scale: currentPhase.name === 'download' ? [1, 1.08, 1] : 1,
                                            opacity: currentPhase.name === 'download' ? 1 : 0.6
                                        }}
                                        transition={{ duration: 0.4 }}
                                        className="p-4 rounded-lg bg-gradient-to-br from-blue-500/15 to-transparent border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
                                    >
                                        <p className="text-2xl mb-2">⬇️</p>
                                        <p className="text-xs text-gray-400 mb-3 font-semibold">DESCARGA</p>
                                        <motion.p
                                            key={`download-${testDetails.currentSpeed}`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-3xl font-black text-blue-400"
                                        >
                                            {currentPhase.name === 'download' && testDetails.currentSpeed > 0
                                                ? testDetails.currentSpeed.toFixed(1)
                                                : '--'}
                                        </motion.p>
                                        <p className="text-xs text-gray-500 mt-1">Mbps</p>
                                    </motion.div>

                                    {/* Subida */}
                                    <motion.div
                                        animate={{
                                            scale: currentPhase.name === 'upload' ? [1, 1.08, 1] : 1,
                                            opacity: currentPhase.name === 'upload' ? 1 : 0.6
                                        }}
                                        transition={{ duration: 0.4 }}
                                        className="p-4 rounded-lg bg-gradient-to-br from-green-500/15 to-transparent border-2 border-green-500/50 shadow-lg shadow-green-500/20"
                                    >
                                        <p className="text-2xl mb-2">⬆️</p>
                                        <p className="text-xs text-gray-400 mb-3 font-semibold">SUBIDA</p>
                                        <motion.p
                                            key={`upload-${testDetails.currentSpeed}`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-3xl font-black text-green-400"
                                        >
                                            {currentPhase.name === 'upload' && testDetails.currentSpeed > 0
                                                ? testDetails.currentSpeed.toFixed(1)
                                                : '--'}
                                        </motion.p>
                                        <p className="text-xs text-gray-500 mt-1">Mbps</p>
                                    </motion.div>
                                </div>

                                {/* Indicadores de fase */}
                                <div className="flex justify-between items-center px-4">
                                    {Object.values(PHASES).slice(1, 5).map((phase) => (
                                        <div key={phase.name} className="flex flex-col items-center">
                                            <motion.div
                                                animate={{
                                                    scale: currentPhase.name === phase.name ? 1.2 : 1,
                                                    opacity: currentPhase.name === phase.name ||
                                                        Object.values(PHASES).findIndex(p => p.name === phase.name) < Object.values(PHASES).findIndex(p => p.name === currentPhase.name) ? 1 : 0.5
                                                }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${currentPhase.name === phase.name
                                                    ? 'border-blue-500 bg-blue-500/20'
                                                    : 'border-white/10'
                                                    }`}
                                            >
                                                {phase.icon}
                                            </motion.div>
                                            <p className="text-xs text-gray-400 mt-2 text-center">{phase.label.split(' ')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : null}

                <AnimatePresence>
                    {result && !testing && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* Resultado Principal */}
                            <div className="text-center">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-block text-5xl mb-3"
                                >
                                    {getInternetRating(result.downloadSpeed).emoji}
                                </motion.div>
                                <p className={`text-5xl font-bold ${getInternetRating(result.downloadSpeed).color}`}>
                                    {getInternetRating(result.downloadSpeed).score}/10
                                </p>
                                <p className={`text-xl ${getInternetRating(result.downloadSpeed).color}`}>
                                    {getInternetRating(result.downloadSpeed).label}
                                </p>
                            </div>

                            {/* Velocidades */}
                            <div className="glow-border rounded-lg p-6">
                                <p className="text-gray-400 text-sm mb-3">Descarga</p>
                                <p className="text-6xl font-black text-blue-400 mb-2">
                                    {result.downloadSpeed.toFixed(1)}
                                </p>
                                <p className="text-gray-400 mb-4">Mbps</p>

                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-gray-400 text-xs mb-2">Subida</p>
                                        <p className="text-3xl font-bold text-green-400">{result.uploadSpeed.toFixed(1)}</p>
                                        <p className="text-gray-400 text-xs">Mbps</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs mb-2">Ping</p>
                                        <p className={`text-3xl font-bold ${result.ping < 20 ? 'text-green-400' : result.ping < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {result.ping.toFixed(0)}
                                        </p>
                                        <p className="text-gray-400 text-xs">ms</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Jitter</span>
                                    <span className="text-white">{result.jitter.toFixed(1)} ms</span>
                                </div>
                                {result.stability !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Estabilidad</span>
                                        <span className="text-white">{result.stability.toFixed(0)}%</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setResult(null)
                                    setUserName('')
                                    setProgress(0)
                                    setCurrentPhase(PHASES.idle)
                                    setStatusMsg('Listo')
                                }}
                                className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 hover:from-blue-600/40 hover:to-purple-600/40 transition-all text-white"
                            >
                                🔄 Realizar Otra Prueba
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
