'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { simulateSpeedTestImproved } from '@/lib/speedtest-improved'
import { getBadgeInfo } from '@/lib/badges'
import { useBadges } from '@/hooks/useBadges'
import { useTestHistory } from '@/hooks/useTestHistory'
import { useLanguage } from '@/hooks/useLanguage'
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

function getPHASES(t: (key: string) => string): Record<string, TestPhase> {
    return {
        idle: { name: 'idle', label: 'Listo', icon: '⚡', color: 'text-gray-400' },
        ping: { name: 'ping', label: 'Midiendo Ping', icon: '📡', color: 'text-yellow-400' },
        download: { name: 'download', label: 'Descargando', icon: '⬇️', color: 'text-blue-400' },
        upload: { name: 'upload', label: 'Subiendo', icon: '⬆️', color: 'text-green-400' },
        complete: { name: 'complete', label: 'Completado', icon: '✅', color: 'text-emerald-400' }
    }
}

export default function SpeedTestCardImproved({ onTestComplete }: SpeedTestCardProps) {
    const { unlockNewBadges } = useBadges()
    const { addTest } = useTestHistory()
    const { t } = useLanguage()
    const PHASES = getPHASES(t)
    
    const [testing, setTesting] = useState(false)
    const [result, setResult] = useState<TestResult | null>(null)
    const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
    const [userName, setUserName] = useState('')
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentPhase, setCurrentPhase] = useState<TestPhase>(PHASES.idle)
    const [statusMsg, setStatusMsg] = useState(PHASES.idle.label)
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
                setError(t('validation.name_too_short'))
                return
            }

            if (userName.trim().length > 30) {
                setError(t('validation.name_too_long'))
                return
            }

            // Validar caracteres inválidos
            if (!/^[a-zA-Z0-9\s\-_.áéíóúÁÉÍÓÚñÑ]+$/.test(userName.trim())) {
                setError(t('validation.name_invalid_chars'))
                return
            }

            // Validar palabras prohibidas
            const { containsBadWords } = require('@/lib/badwords')
            if (containsBadWords(userName.trim())) {
                setError(t('validation.name_bad_words'))
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
            <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden pointer-events-auto" style={{ touchAction: 'auto', willChange: 'transform' }}>
                {/* Fondo animado */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="relative w-full h-full overflow-y-auto scrollbar-hide p-4 md:p-6 flex flex-col items-center pointer-events-auto">
                    {/* Header - Más compacto */}
                    <div className="text-center mb-4 w-full pt-4 sm:pt-6">
                        <motion.p
                            className={`text-3xl sm:text-4xl md:text-5xl font-black mb-2 ${currentPhase.color}`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            {currentPhase.icon}
                        </motion.p>
                        <h3 className={`text-xl sm:text-2xl md:text-3xl font-black mb-1 ${currentPhase.color}`}>
                            {currentPhase.label}
                        </h3>
                        <p className="text-gray-300 text-xs sm:text-sm">{statusMsg}</p>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full max-w-2xl mb-6 pointer-events-auto">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-semibold pointer-events-auto">
                            <span>Progreso</span>
                            <span className="text-lg font-bold text-blue-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/20 pointer-events-auto">
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', stiffness: 80 }}
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/60"
                            />
                        </div>
                    </div>

                    {/* Métricas en tiempo real */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl mb-4 sm:mb-6 pointer-events-auto">
                        {/* Ping */}
                        <motion.div
                            animate={{
                                scale: currentPhase.name === 'ping' ? [1, 1.05, 1] : 1,
                                opacity: currentPhase.name === 'ping' ? 1 : 0.6
                            }}
                            transition={{ duration: 0.4 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/50 shadow-lg shadow-yellow-500/10 backdrop-blur-sm hover:shadow-yellow-500/30 transition-all duration-300"
                        >
                            <p className="text-3xl mb-2">📡</p>
                            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">PING</p>
                            <motion.p
                                key={`ping-${testDetails.currentSpeed}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-black text-yellow-300"
                            >
                                {currentPhase.name === 'ping' && testDetails.currentSpeed > 0
                                    ? testDetails.currentSpeed.toFixed(0)
                                    : '--'}
                            </motion.p>
                            <p className="text-xs text-gray-500 mt-2">ms</p>
                        </motion.div>

                        {/* Descarga */}
                        <motion.div
                            animate={{
                                scale: currentPhase.name === 'download' ? [1, 1.05, 1] : 1,
                                opacity: currentPhase.name === 'download' ? 1 : 0.6
                            }}
                            transition={{ duration: 0.4 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/50 shadow-lg shadow-blue-500/10 backdrop-blur-sm hover:shadow-blue-500/30 transition-all duration-300"
                        >
                            <p className="text-3xl mb-2">⬇️</p>
                            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">DESCARGA</p>
                            <motion.p
                                key={`download-${testDetails.currentSpeed}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-black text-blue-300"
                            >
                                {currentPhase.name === 'download' && testDetails.currentSpeed > 0
                                    ? testDetails.currentSpeed.toFixed(1)
                                    : '--'}
                            </motion.p>
                            <p className="text-xs text-gray-500 mt-2">Mbps</p>
                        </motion.div>

                        {/* Subida */}
                        <motion.div
                            animate={{
                                scale: currentPhase.name === 'upload' ? [1, 1.05, 1] : 1,
                                opacity: currentPhase.name === 'upload' ? 1 : 0.6
                            }}
                            transition={{ duration: 0.4 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/50 shadow-lg shadow-green-500/10 backdrop-blur-sm hover:shadow-green-500/30 transition-all duration-300"
                        >
                            <p className="text-3xl mb-2">⬆️</p>
                            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">SUBIDA</p>
                            <motion.p
                                key={`upload-${testDetails.currentSpeed}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-black text-green-300"
                            >
                                {currentPhase.name === 'upload' && testDetails.currentSpeed > 0
                                    ? testDetails.currentSpeed.toFixed(1)
                                    : '--'}
                            </motion.p>
                            <p className="text-xs text-gray-500 mt-2">Mbps</p>
                        </motion.div>
                    </div>

                    {/* Gráficas en tiempo real */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl mb-3 sm:mb-4 pointer-events-auto">
                        {chartData.ping.length > 0 && (
                            <SpeedChartLive
                                data={chartData.ping}
                                title="📡 Ping"
                                unit="ms"
                                color="#fbbf24"
                                height={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
                            />
                        )}
                        {chartData.download.length > 0 && (
                            <SpeedChartLive
                                data={chartData.download}
                                title="⬇️ Descarga"
                                unit="Mbps"
                                color="#3b82f6"
                                height={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
                            />
                        )}
                        {chartData.upload.length > 0 && (
                            <SpeedChartLive
                                data={chartData.upload}
                                title="⬆️ Subida"
                                unit="Mbps"
                                color="#22c55e"
                                height={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
                            />
                        )}
                    </div>

                    {/* Indicadores de fase */}
                    <div className="flex justify-center items-center gap-1 sm:gap-2 mt-2 pointer-events-auto flex-wrap">
                        {Object.values(PHASES).slice(1, 5).map((phase) => (
                            <div key={phase.name} className="flex flex-col items-center">
                                <motion.div
                                    animate={{
                                        scale: currentPhase.name === phase.name ? 1.2 : 1,
                                        opacity: currentPhase.name === phase.name ||
                                            Object.values(PHASES).findIndex(p => p.name === phase.name) < Object.values(PHASES).findIndex(p => p.name === currentPhase.name) ? 1 : 0.3
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border transition-all ${currentPhase.name === phase.name
                                        ? 'border-blue-500 bg-blue-500/30 shadow-lg shadow-blue-500/60'
                                        : 'border-white/30'
                                        }`}
                                >
                                    {phase.icon}
                                </motion.div>
                                <p className="text-xs text-gray-400 mt-1 text-center font-semibold">{phase.label.split(' ')[0]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // ========== NORMAL CARD VIEW ==========
    return (
        <div className="w-full relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glow-border rounded-lg md:rounded-xl p-6 md:p-8 bg-gradient-to-br from-white/5 to-white/0 relative z-10 backdrop-blur-sm hover:from-white/8 transition-all duration-300"
            >
                <div className="text-center">
                    {!result ? (
                        <>
                            <div className="mb-8">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-block text-5xl md:text-6xl mb-4 pointer-events-none"
                                >
                                    {currentPhase.icon}
                                </motion.div>
                                <h2 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent pointer-events-none">
                                    Prueba tu WiFi
                                </h2>
                            </div>

                            <ValidationError message={error} type="error" onClose={() => setError(null)} />

                            {!isAnonymous && (
                                <motion.input
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleStartTest()
                                        }
                                    }}
                                    className="w-full px-4 py-3 md:py-4 rounded-xl mb-6 bg-white/5 border-2 border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/20 transition-all text-base cursor-text pointer-events-auto relative z-10 backdrop-blur-sm"
                                    autoFocus
                                />
                            )}

                            <div className="space-y-3 mb-6 relative z-20">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleStartTest}
                                    className="w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-white cursor-pointer shadow-lg hover:shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 pointer-events-auto relative z-10 backdrop-blur-sm border border-blue-400/20"
                                >
                                    🚀 {isAnonymous ? 'Comenzar (Anónima)' : 'Comenzar Prueba'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setIsAnonymous(!isAnonymous)
                                        setUserName('')
                                        setError(null)
                                    }}
                                    className={`w-full py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 cursor-pointer pointer-events-auto relative z-10 backdrop-blur-sm border ${isAnonymous
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg hover:shadow-emerald-500/40 border-emerald-400/20'
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300 border-white/20 hover:border-white/40'
                                        }`}
                                >
                                    {isAnonymous ? '🔒 Anónimo Activo' : '👤 Modo Anónimo'}
                                </motion.button>
                            </div>

                            <p className="text-xs md:text-sm text-gray-400 px-2 pointer-events-none">
                                {isAnonymous
                                    ? '⚡ Sin datos • No en ranking'
                                    : '📊 ~1-2 min • En ranking'}
                            </p>
                        </>
                    ) : null}

                    <AnimatePresence>
                        {result && !testing && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="space-y-6 pointer-events-auto relative z-10"
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

                                {/* Unlocked badges */}
                                 {unlockedBadges.length > 0 && (
                                     <motion.div
                                         initial={{ opacity: 0, y: 10 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30"
                                     >
                                         <p className="text-sm font-bold text-purple-300 mb-3">🏅 {t('badges.unlocked')}:</p>
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
                                                         <p className="font-semibold text-white">{badge.name ? t(badge.name) : 'Unknown'}</p>
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
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setResult(null)
                                        setUserName('')
                                        setProgress(0)
                                        setCurrentPhase(PHASES.idle)
                                        setStatusMsg('Listo')
                                        setUnlockedBadges([])
                                    }}
                                    className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-blue-400/30 shadow-lg hover:shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all text-white cursor-pointer pointer-events-auto relative z-10 backdrop-blur-sm"
                                >
                                    🔄 Realizar Otra Prueba
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
