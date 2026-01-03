'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { simulateSpeedTest } from '@/lib/speedtest'
import ValidationError from './ValidationError'

interface TestResult {
    downloadSpeed: number
    uploadSpeed: number
    ping: number
    jitter: number
}

interface SpeedTestCardProps {
    onTestComplete?: (result: TestResult) => void
}

interface TestMetrics {
    currentDownload: number
    currentUpload: number
    currentPing: number
    testPhase: 'idle' | 'download' | 'upload' | 'ping' | 'complete'
}

export default function SpeedTestCard({ onTestComplete }: SpeedTestCardProps) {
    const [testing, setTesting] = useState(false)
    const [result, setResult] = useState<TestResult | null>(null)
    const [userName, setUserName] = useState('')
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState('Listo')
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<TestMetrics>({
        currentDownload: 0,
        currentUpload: 0,
        currentPing: 0,
        testPhase: 'idle'
    })

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
        setError(null)

        // Validar nombre
        const nameError = validateUserName(userName)
        if (nameError) {
            setError(nameError)
            return
        }

        setTesting(true)
        setProgress(0)
        setStatus('Midiendo ping...')
        setMetrics({
            currentDownload: 0,
            currentUpload: 0,
            currentPing: 0,
            testPhase: 'ping'
        })

        try {
            // Ejecutar prueba de velocidad REAL con callbacks de progreso
            const testResult = await simulateSpeedTest((progress, status) => {
                setProgress(progress)
                setStatus(status)

                // Actualizar métricas según fase
                if (status.includes('Descargando')) {
                    setMetrics(prev => ({
                        ...prev,
                        testPhase: 'download'
                    }))
                } else if (status.includes('Subiendo')) {
                    setMetrics(prev => ({
                        ...prev,
                        testPhase: 'upload'
                    }))
                }
            })

            setProgress(98)
            setStatus('Guardando resultado...')

            // Enviar resultado a API
            const response = await fetch('/api/speedtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, testResult }),
            })

            if (!response.ok) {
                let errorMsg = 'Error al procesar la prueba'
                try {
                    const errorData = await response.json()
                    errorMsg = errorData.error || errorMsg
                } catch { }

                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After')
                    const seconds = retryAfter ? parseInt(retryAfter) : 60
                    setError(`Demasiados intentos. Espera ${seconds} segundos`)
                } else {
                    setError(errorMsg)
                }
                setTesting(false)
                setMetrics({ currentDownload: 0, currentUpload: 0, currentPing: 0, testPhase: 'idle' })
                return
            }

            let data
            try {
                data = await response.json()
            } catch {
                setError('Respuesta del servidor inválida')
                setTesting(false)
                setMetrics({ currentDownload: 0, currentUpload: 0, currentPing: 0, testPhase: 'idle' })
                return
            }

            if (!data.success || !data.result) {
                setError(data.error || 'Error desconocido')
                setTesting(false)
                setMetrics({ currentDownload: 0, currentUpload: 0, currentPing: 0, testPhase: 'idle' })
                return
            }

            setProgress(100)
            setStatus('Completado')
            setMetrics({
                currentDownload: data.result.downloadSpeed,
                currentUpload: data.result.uploadSpeed,
                currentPing: data.result.ping,
                testPhase: 'complete'
            })
            setResult(data.result)

            if (onTestComplete) {
                onTestComplete(data.result)
            }

            // Mostrar resultado por 5 segundos antes de permitir otra prueba
            setTimeout(() => {
                setTesting(false)
                setProgress(0)
                setStatus('Listo')
                setMetrics({ currentDownload: 0, currentUpload: 0, currentPing: 0, testPhase: 'idle' })
            }, 5000)
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error en prueba:', error)
            setError(`Error: ${errorMsg}`)
            setTesting(false)
            setMetrics({ currentDownload: 0, currentUpload: 0, currentPing: 0, testPhase: 'idle' })
        }
    }

    const validateUserName = (name: string): string | null => {
        if (!name.trim()) {
            return 'Por favor ingresa tu nombre'
        }
        if (name.trim().length < 2) {
            return 'El nombre debe tener al menos 2 caracteres'
        }
        if (name.trim().length > 255) {
            return 'El nombre es muy largo (máximo 255 caracteres)'
        }
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glow-border rounded-lg p-8 backdrop-blur-sm bg-gradient-to-br from-white/5 to-white/0"
        >
            <div className="text-center">
                <div className="mb-4">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block text-5xl mb-3"
                    >
                        ⚡
                    </motion.div>
                </div>
                <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                    Prueba tu WiFi
                </h2>
                <p className="text-gray-400 text-base mb-6">
                    Descubre la velocidad real de tu conexión
                </p>

                <ValidationError
                    message={error}
                    type="error"
                    onClose={() => setError(null)}
                />

                {!result ? (
                    <>
                        {/* Input para nombre */}
                        <input
                            type="text"
                            placeholder="Tu nombre"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={testing}
                            className="w-full px-4 py-3 rounded-lg mb-6 bg-white/5 border border-white/10 text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />

                        {/* Estado de prueba EN VIVO */}
                        {testing && (
                            <div className="mb-6 space-y-4">
                                {/* Barra de progreso principal */}
                                <div className="mb-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-400 font-semibold">
                                            {metrics.testPhase === 'download' && '⬇️ Midiendo Descarga'}
                                            {metrics.testPhase === 'upload' && '⬆️ Midiendo Subida'}
                                            {metrics.testPhase === 'ping' && '📡 Midiendo Ping'}
                                        </span>
                                        <span className="text-sm font-semibold text-blue-400">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${progress}%` }}
                                            transition={{ type: 'spring', stiffness: 100 }}
                                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Métricas en vivo mejoradas */}
                                <div className="space-y-4 mb-6">
                                    {/* Barra de estado mejorada */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                                {metrics.testPhase === 'download' && '⬇️ Midiendo Descarga'}
                                                {metrics.testPhase === 'upload' && '⬆️ Midiendo Subida'}
                                                {metrics.testPhase === 'ping' && '📡 Midiendo Ping'}
                                            </span>
                                            <span className="text-sm font-bold text-blue-400">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                                            <motion.div
                                                animate={{ width: `${progress}%` }}
                                                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Métricas instantáneas en tarjetas mejoradas */}
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        <motion.div
                                            animate={{
                                                scale: metrics.testPhase === 'download' ? [1, 1.08, 1] : 1,
                                                borderColor: metrics.testPhase === 'download' ?
                                                    ['rgba(59,130,246,0.3)', 'rgba(59,130,246,1)', 'rgba(59,130,246,0.3)'] :
                                                    'rgba(255,255,255,0.1)'
                                            }}
                                            transition={{ duration: 0.6 }}
                                            className="border-2 rounded-lg p-3 text-center bg-gradient-to-br from-blue-500/10 to-transparent"
                                        >
                                            <p className="text-2xl mb-1">⬇️</p>
                                            <p className="text-xs text-gray-400 mb-1 font-semibold">Descarga</p>
                                            <p className="text-xl font-bold text-blue-400">
                                                {metrics.currentDownload.toFixed(1)}
                                            </p>
                                            <p className="text-xs text-gray-500">Mbps</p>
                                        </motion.div>

                                        <motion.div
                                            animate={{
                                                scale: metrics.testPhase === 'upload' ? [1, 1.08, 1] : 1,
                                                borderColor: metrics.testPhase === 'upload' ?
                                                    ['rgba(34,197,94,0.3)', 'rgba(34,197,94,1)', 'rgba(34,197,94,0.3)'] :
                                                    'rgba(255,255,255,0.1)'
                                            }}
                                            transition={{ duration: 0.6 }}
                                            className="border-2 rounded-lg p-3 text-center bg-gradient-to-br from-green-500/10 to-transparent"
                                        >
                                            <p className="text-2xl mb-1">⬆️</p>
                                            <p className="text-xs text-gray-400 mb-1 font-semibold">Subida</p>
                                            <p className="text-xl font-bold text-green-400">
                                                {metrics.currentUpload.toFixed(1)}
                                            </p>
                                            <p className="text-xs text-gray-500">Mbps</p>
                                        </motion.div>

                                        <motion.div
                                            animate={{
                                                scale: metrics.testPhase === 'ping' ? [1, 1.08, 1] : 1,
                                                borderColor: metrics.testPhase === 'ping' ?
                                                    ['rgba(234,179,8,0.3)', 'rgba(234,179,8,1)', 'rgba(234,179,8,0.3)'] :
                                                    'rgba(255,255,255,0.1)'
                                            }}
                                            transition={{ duration: 0.6 }}
                                            className="border-2 rounded-lg p-3 text-center bg-gradient-to-br from-yellow-500/10 to-transparent"
                                        >
                                            <p className="text-2xl mb-1">📡</p>
                                            <p className="text-xs text-gray-400 mb-1 font-semibold">Ping</p>
                                            <p className="text-xl font-bold text-yellow-400">
                                                {metrics.currentPing.toFixed(1)}
                                            </p>
                                            <p className="text-xs text-gray-500">ms</p>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón de prueba */}
                        <button
                            onClick={handleStartTest}
                            disabled={testing}
                            className="w-full py-4 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white font-bold mb-4"
                        >
                            {testing ? '⚡ Analizando...' : '🚀 Comenzar Prueba'}
                        </button>

                        <p className="text-xs text-gray-400">
                            La prueba toma aproximadamente 10 segundos para resultados precisos
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

                            {/* Análisis detallado */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-4 mb-6"
                            >
                                {/* Estándares de referencia */}
                                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 border border-white/10">
                                    <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">📊 Análisis de Calidad</p>

                                    <div className="space-y-2">
                                        {/* Descarga */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Descarga</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                                                        style={{ width: `${Math.min((result.downloadSpeed / 200) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-semibold ${result.downloadSpeed >= 100 ? 'text-green-400' :
                                                        result.downloadSpeed >= 50 ? 'text-yellow-400' :
                                                            'text-red-400'
                                                    }`}>
                                                    {result.downloadSpeed >= 100 ? '✓' :
                                                        result.downloadSpeed >= 50 ? '⚠' : '✗'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Subida */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Subida</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-green-400"
                                                        style={{ width: `${Math.min((result.uploadSpeed / 50) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-semibold ${result.uploadSpeed >= 20 ? 'text-green-400' :
                                                        result.uploadSpeed >= 10 ? 'text-yellow-400' :
                                                            'text-red-400'
                                                    }`}>
                                                    {result.uploadSpeed >= 20 ? '✓' :
                                                        result.uploadSpeed >= 10 ? '⚠' : '✗'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Latencia */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Latencia</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                                                        style={{ width: `${Math.max(0, Math.min((1 - result.ping / 100) * 100, 100))}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-semibold ${result.ping <= 30 ? 'text-green-400' :
                                                        result.ping <= 60 ? 'text-yellow-400' :
                                                            'text-red-400'
                                                    }`}>
                                                    {result.ping <= 30 ? '✓' :
                                                        result.ping <= 60 ? '⚠' : '✗'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recomendación */}
                                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-3 border border-white/10">
                                    <p className="text-xs text-gray-400 font-semibold mb-2">💡 Recomendación</p>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {result.downloadSpeed >= 100 && result.uploadSpeed >= 20
                                            ? '✅ Excelente para todas las actividades: streaming 4K, videollamadas, gaming online y trabajo remoto.'
                                            : result.downloadSpeed >= 50 && result.uploadSpeed >= 10
                                                ? '⚠️ Buena para la mayoría de actividades. Puede tener limitaciones en streaming 4K simultáneo.'
                                                : '⚠️ Conexión básica. Se recomienda mejorar para streaming HD y llamadas de video estables.'}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setResult(null)
                                setUserName('')
                            }}
                            className="w-full py-4 rounded-lg font-semibold bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 border border-blue-500/50 transition-all duration-300 text-white"
                        >
                            🔄 Realizar Otra Prueba
                        </motion.button>
                    </>
                )}
            </div>
        </motion.div>
    )
}
