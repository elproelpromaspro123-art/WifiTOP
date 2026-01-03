'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { simulateSpeedTestImproved } from '@/lib/speedtest-improved'
import { getBadgeInfo } from '@/lib/badges'
import { useBadges } from '@/hooks/useBadges'
import { useTestHistory } from '@/hooks/useTestHistory'
import ValidationError from './ValidationError'
import ShareButtons from './ShareButtons'
import SpeedChartLive from './SpeedChartLive'

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
    const { unlockNewBadges } = useBadges()
    const { addTest } = useTestHistory()
    const [testing, setTesting] = useState(false)
    const [result, setResult] = useState<TestResult | null>(null)
    const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
    const [userName, setUserName] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentPhase, setCurrentPhase] = useState<TestPhase>(PHASES.idle)
    const [statusMsg, setStatusMsg] = useState('Listo')
    const [error, setError] = useState<string | null>(null)
    const [testDetails, setTestDetails] = useState({
        currentSpeed: 0,
        phase: 'idle' as 'ping' | 'download' | 'upload'
    })
    const [chartData, setChartData] = useState({
        download: [] as Array<{ time: number; value: number }>,
        upload: [] as Array<{ time: number; value: number }>,
        ping: [] as Array<{ time: number; value: number }>
    })
    const [testStartTime, setTestStartTime] = useState(0)

    const handleStartTest = async () => {
        setError(null)

        if (!isAnonymous) {
            if (!userName.trim()) {
                setError('Por favor ingresa tu nombre o selecciona modo anónimo')
                return
            }

            if (userName.trim().length < 2) {
                setError('El nombre debe tener al menos 2 caracteres')
                return
            }
        }

        setTesting(true)
        setProgress(0)
        setCurrentPhase(PHASES.ping)
        setStatusMsg('Iniciando prueba...')
        setTestDetails({ currentSpeed: 0, phase: 'ping' })
        setTestStartTime(Date.now())
        setChartData({ download: [], upload: [], ping: [] })

        try {
            const testResult = await simulateSpeedTestImproved((progress, status, details) => {
                setProgress(progress)
                setStatusMsg(status)

                if (details?.phase && details.currentSpeed) {
                    setCurrentPhase(PHASES[details.phase])
                    setTestDetails({
                        currentSpeed: details.currentSpeed || 0,
                        phase: details.phase
                    })

                    const timeElapsed = (Date.now() - testStartTime) / 1000
                    setChartData(prev => {
                        const newData = { ...prev }
                        const speed = details.currentSpeed || 0
                        if (details.phase === 'download') {
                            newData.download = [...prev.download, { time: timeElapsed, value: speed }]
                        } else if (details.phase === 'upload') {
                            newData.upload = [...prev.upload, { time: timeElapsed, value: speed }]
                        } else if (details.phase === 'ping') {
                            newData.ping = [...prev.ping, { time: timeElapsed, value: speed }]
                        }
                        return newData
                    })
                }
            })

            setProgress(98)

            if (isAnonymous) {
                setProgress(100)
                setCurrentPhase(PHASES.complete)
                setStatusMsg('Prueba completada')
                setResult({
                    downloadSpeed: testResult.downloadSpeed,
                    uploadSpeed: testResult.uploadSpeed,
                    ping: testResult.ping,
                    jitter: testResult.jitter || 0
                })

                setTimeout(() => {
                    setTesting(false)
                    setProgress(0)
                    setCurrentPhase(PHASES.idle)
                    setStatusMsg('Listo')
                    setTestDetails({ currentSpeed: 0, phase: 'ping' })
                }, 5000)
                return
            }

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

            addTest({
                downloadSpeed: data.result.downloadSpeed,
                uploadSpeed: data.result.uploadSpeed,
                ping: data.result.ping,
                jitter: data.result.jitter || 0,
                stability: data.result.stability || 0,
                userName
            })

            const newBadges = unlockNewBadges(
                data.result.downloadSpeed,
                data.result.uploadSpeed,
                data.result.ping,
                data.result.jitter || 0,
                data.result.stability || 0,
                data.rank
            )
            setUnlockedBadges(newBadges)

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

    // ========== FULLSCREEN MODAL DURANTE TESTING ==========
    if (testing) {
        return (
            <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen bg-gradient-to-b from-black via-slate-950 to-black overflow-y-auto pointer-events-auto" style={{ touchAction: 'auto', willChange: 'transform' }}>
                <div className="w-screen min-h-screen p-4 md:p-8 flex flex-col items-center justify-center pointer-events-auto">
                    {/* Header */}
                    <div className="text-center mb-12 w-full">
                        <motion.p
                            className={`text-6xl md:text-7xl font-black mb-4 ${currentPhase.color}`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            {currentPhase.icon}
                        </motion.p>
                        <h3 className={`text-4xl md:text-5xl font-black mb-3 ${currentPhase.color}`}>
                            {currentPhase.label}
                        </h3>
                        <p className="text-gray-300 text-xl">{statusMsg}</p>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full max-w-3xl mb-12 pointer-events-auto">
                        <div className="flex justify-between text-sm text-gray-400 mb-4 font-semibold pointer-events-auto">
                            <span>Progreso General</span>
                            <span className="text-3xl font-bold text-blue-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-5 rounded-full bg-white/10 overflow-hidden border-2 border-white/20 pointer-events-auto">
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', stiffness: 80 }}
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-blue-500/60"
                            />
                        </div>
                    </div>

                    {/* Métricas en tiempo real */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12 pointer-events-auto">
                        {/* Ping */}
                        <motion.div
                            animate={{
                                scale: currentPhase.name === 'ping' ? [1, 1.1, 1] : 1,
                                opacity: currentPhase.name === 'ping' ? 1 : 0.6
                            }}
                            transition={{ duration: 0.4 }}
                            className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 to-transparent border-2 border-yellow-500/60 shadow-xl shadow-yellow-500/30"
                        >
                            <p className="text-4xl mb-3">📡</p>
                            <p className="text-sm text-gray-400 mb-4 font-semibold uppercase tracking-wider">PING</p>
                            <motion.p
                                key={`ping-${testDetails.currentSpeed}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-5xl font-black text-yellow-400"
                            >
                                {currentPhase.name === 'ping' && testDetails.currentSpeed > 0
                                    ? testDetails.currentSpeed.toFixed(0)
                                    : '--'}
                            </motion.p>
                            <p className="text-sm text-gray-500 mt-2">ms</p>
                        </motion.div>

                        {/* Descarga */}
                        <motion.div
                            animate={{
                                scale: currentPhase.name === 'download' ? [1, 1.1, 1] : 1,
                                opacity: currentPhase.name === 'download' ? 1 : 0.6
                            }}
                            transition={{ duration: 0.4 }}
                            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent border-2 border-blue-500/60 shadow-xl shadow-blue-500/30"
                        >
                            <p className="text-4xl mb-3">⬇️</p>
                            <p className="text-sm text-gray-400 mb-4 font-semibold uppercase tracking-wider">DESCARGA</p>
                            <motion.p
                                key={`download-${testDetails.currentSpeed}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-5xl font-black text-blue-400"
                            >
                                {currentPhase.name === 'download' && testDetails.currentSpeed > 0
                                    ? testDetails.currentSpeed.toFixed(1)
                                    : '--'}
                            </motion.p>
                            <p className="text-sm text-gray-500 mt-2">Mbps</p>
                        </motion.div>

                        {/* Subida */}
                        <motion.div
                            animate={{
                                scale: currentPhase.name === 'upload' ? [1, 1.1, 1] : 1,
                                opacity: currentPhase.name === 'upload' ? 1 : 0.6
                            }}
                            transition={{ duration: 0.4 }}
                            className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-transparent border-2 border-green-500/60 shadow-xl shadow-green-500/30"
                        >
                            <p className="text-4xl mb-3">⬆️</p>
                            <p className="text-sm text-gray-400 mb-4 font-semibold uppercase tracking-wider">SUBIDA</p>
                            <motion.p
                                key={`upload-${testDetails.currentSpeed}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-5xl font-black text-green-400"
                            >
                                {currentPhase.name === 'upload' && testDetails.currentSpeed > 0
                                    ? testDetails.currentSpeed.toFixed(1)
                                    : '--'}
                            </motion.p>
                            <p className="text-sm text-gray-500 mt-2">Mbps</p>
                        </motion.div>
                    </div>

                    {/* Gráficas en tiempo real */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12 pointer-events-auto">
                        {chartData.ping.length > 0 && (
                            <SpeedChartLive
                                data={chartData.ping}
                                title="📡 Ping en Tiempo Real"
                                unit="ms"
                                color="#fbbf24"
                                height={150}
                            />
                        )}
                        {chartData.download.length > 0 && (
                            <SpeedChartLive
                                data={chartData.download}
                                title="⬇️ Descarga en Tiempo Real"
                                unit="Mbps"
                                color="#3b82f6"
                                height={150}
                            />
                        )}
                        {chartData.upload.length > 0 && (
                            <SpeedChartLive
                                data={chartData.upload}
                                title="⬆️ Subida en Tiempo Real"
                                unit="Mbps"
                                color="#22c55e"
                                height={150}
                            />
                        )}
                    </div>

                    {/* Indicadores de fase */}
                    <div className="flex justify-center items-center gap-12 mt-8 pointer-events-auto">
                        {Object.values(PHASES).slice(1, 5).map((phase) => (
                            <div key={phase.name} className="flex flex-col items-center">
                                <motion.div
                                    animate={{
                                        scale: currentPhase.name === phase.name ? 1.4 : 1,
                                        opacity: currentPhase.name === phase.name ||
                                            Object.values(PHASES).findIndex(p => p.name === phase.name) < Object.values(PHASES).findIndex(p => p.name === currentPhase.name) ? 1 : 0.3
                                    }}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition-all ${currentPhase.name === phase.name
                                        ? 'border-blue-500 bg-blue-500/30 shadow-2xl shadow-blue-500/60'
                                        : 'border-white/30'
                                        }`}
                                >
                                    {phase.icon}
                                </motion.div>
                                <p className="text-sm text-gray-400 mt-3 text-center font-semibold">{phase.label.split(' ')[0]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // ========== NORMAL CARD VIEW ==========
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glow-border rounded-lg p-8 backdrop-blur-sm bg-gradient-to-br from-white/5 to-white/0 pointer-events-auto"
        >
            <div className="text-center pointer-events-auto">
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

                        {!isAnonymous && (
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleStartTest()
                                    }
                                }}
                                className="w-full px-4 py-3 rounded-lg mb-6 bg-white/5 border-2 border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors pointer-events-auto"
                                autoFocus
                            />
                        )}

                        <div className="space-y-3 mb-6 pointer-events-auto">
                            <button
                                onClick={handleStartTest}
                                className="w-full py-4 rounded-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-white cursor-pointer active:scale-95 shadow-lg hover:shadow-xl shadow-blue-500/40 pointer-events-auto"
                            >
                                🚀 {isAnonymous ? 'Comenzar Prueba (Anónima)' : 'Comenzar Prueba'}
                            </button>

                            <button
                                onClick={() => {
                                    setIsAnonymous(!isAnonymous)
                                    setUserName('')
                                    setError(null)
                                }}
                                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${isAnonymous
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                                    : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/20'
                                    } pointer-events-auto`}
                            >
                                {isAnonymous ? '🔒 Modo Anónimo Activo' : '👤 Modo Anónimo'}
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 px-2">
                            {isAnonymous
                                ? '⚡ Prueba sin compartir datos • No aparecerás en el ranking'
                                : '📊 La prueba durará aprox. 1-2 minutos • Aparecerás en el ranking'}
                        </p>
                    </>
                ) : null}

                <AnimatePresence>
                    {result && !testing && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="space-y-6 pointer-events-auto"
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

                            {/* Badges desbloqueados */}
                            {unlockedBadges.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30"
                                >
                                    <p className="text-sm font-bold text-purple-300 mb-3">🏅 Badges Desbloqueados:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {unlockedBadges.map(badgeId => {
                                            const badge = getBadgeInfo(badgeId)
                                            return badge ? (
                                                <motion.div
                                                    key={badgeId}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring' }}
                                                    className={`bg-gradient-to-br ${badge.color} rounded-lg p-2 text-center text-xs`}
                                                >
                                                    <p className="text-lg mb-1">{badge.icon}</p>
                                                    <p className="font-semibold text-white">{badge.name}</p>
                                                </motion.div>
                                            ) : null
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Botones de compartir */}
                            <ShareButtons
                                downloadSpeed={result.downloadSpeed}
                                uploadSpeed={result.uploadSpeed}
                                ping={result.ping}
                                userName={userName || 'Usuario'}
                            />

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setResult(null)
                                    setUserName('')
                                    setProgress(0)
                                    setCurrentPhase(PHASES.idle)
                                    setStatusMsg('Listo')
                                    setUnlockedBadges([])
                                }}
                                className="w-full py-4 rounded-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-blue-400 shadow-lg hover:shadow-xl shadow-blue-500/40 transition-all text-white cursor-pointer active:scale-95 pointer-events-auto"
                            >
                                🔄 Realizar Otra Prueba
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
