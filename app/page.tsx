'use client'

import { useState, useEffect } from 'react'
import SpeedTestCardImproved from '@/components/SpeedTestCardImproved'
import RankingTable from '@/components/RankingTable'
import UserBadgesDisplay from '@/components/UserBadgesDisplay'
import TestHistoryDisplay from '@/components/TestHistoryDisplay'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ValidationError from '@/components/ValidationError'
import WhatsNewModal from '@/components/WhatsNewModal'
import { useStats } from '@/hooks/useStats'
import { useRanking } from '@/hooks/useRanking'
import { motion } from 'framer-motion'

export default function Home() {
    const [results, setResults] = useState<any>(null)
    const [statsError, setStatsError] = useState<string | null>(null)
    const [showWhatsNew, setShowWhatsNew] = useState(false)
    const [highlightResults, setHighlightResults] = useState(false)
    const { stats, loading, error, refetch } = useStats()
    const { refetch: refetchRanking } = useRanking()

    // Mostrar modal de novedades solo la primera vez
    useEffect(() => {
        const hasSeenWhatsNew = localStorage.getItem('wifitop_seen_whatsnew')
        if (!hasSeenWhatsNew) {
            setShowWhatsNew(true)
            localStorage.setItem('wifitop_seen_whatsnew', 'true')
        }
    }, [])

    const handleTestComplete = (result: any) => {
        setResults(result)
        setHighlightResults(true)

        // Auto-scroll a resultados después de un pequeño delay
        setTimeout(() => {
            const resultsElement = document.getElementById('user-results')
            if (resultsElement) {
                resultsElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 300)

        // Remover highlight después de 3 segundos
        setTimeout(() => {
            setHighlightResults(false)
        }, 3000)

        setTimeout(() => {
            refetch()
            refetchRanking()
        }, 1000)
    }

    if (error && error !== statsError) {
        setStatsError(error)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black pointer-events-auto" style={{ pointerEvents: 'auto', touchAction: 'auto' }}>
            <WhatsNewModal isOpen={showWhatsNew} onClose={() => setShowWhatsNew(false)} />

            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -left-1/2 bottom-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 pointer-events-auto">
                <Header />

                {/* Error Display */}
                {statsError && (
                    <div className="container mx-auto px-4 mt-4">
                        <ValidationError message={statsError} type="error" onClose={() => setStatsError(null)} />
                    </div>
                )}

                {/* Hero Section */}
                <section className="container mx-auto px-4 py-8 md:py-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6 md:space-y-8"
                    >
                        {/* Main Title */}
                        <div className="space-y-3 md:space-y-4">
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter">
                                <span className="bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
                                    WifiTOP
                                </span>
                            </h1>
                            <div className="space-y-2 md:space-y-3">
                                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-white">Presume tu velocidad de WiFi 🚀</p>
                                <p className="text-sm sm:text-base md:text-xl text-gray-400 px-2">Ranking global con 10,000+ usuarios | Mediciones precisas | Badges exclusivos</p>
                            </div>
                        </div>

                        {/* CTA Divider */}
                        <motion.div
                            animate={{ width: ['0%', '100%'] }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto max-w-xs"
                        />

                        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto px-2">
                            Speedtest ultra preciso con detección automática de fraude. Compite con usuarios de todo el mundo, desbloquea badges únicos y demuestra que tienes la mejor conexión.
                        </p>
                    </motion.div>
                </section>

                {/* About Section */}
                <section id="about" className="container mx-auto px-4 py-8 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="text-center mb-8 md:mb-12">
                            <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent">
                                Sobre WifiTOP
                            </h2>
                            <p className="text-gray-400 text-base md:text-lg">La plataforma definitiva de speedtest con ranking global</p>
                        </div>

                        <div className="glow-border rounded-xl p-6 md:p-8 bg-gradient-to-br from-white/5 to-white/0">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3">¿Qué es WifiTOP?</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        WifiTOP es la plataforma más avanzada de pruebas de velocidad de internet. Mide con precisión tu descarga, subida, ping y jitter usando servidores globales de Cloudflare. Compite en un ranking de 10,000+ usuarios y desbloquea badges exclusivos mientras mantienes la integridad con detección automática de fraude.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3">Lo que Obtienes</h3>
                                    <ul className="space-y-2 text-gray-300">
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            <span>Mediciones ultra precisas: descarga, subida, ping, jitter, estabilidad</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            <span>Ranking global en tiempo real con 10,000 mejores resultados</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            <span>12+ badges desbloqueables según tus logros</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            <span>Detección inteligente de fraude y anomalías</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            <span>Modo anónimo para pruebas privadas</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-400 font-bold">✓</span>
                                            <span>Compartir resultados en redes sociales</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-3">¿Por qué WifiTOP?</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        Somos la única plataforma con detección automática de fraude, ranking verificado y badges exclusivos. Con tecnología de Cloudflare y análisis en tiempo real, WifiTOP es tu aliado definitivo para medir, compartir y mejorar tu conexión de internet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Main Content Grid */}
                <div className="container mx-auto px-4 py-6 md:py-16">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-16"
                    >
                        {/* Speed Test Card */}
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <SpeedTestCardImproved onTestComplete={handleTestComplete} />
                        </motion.div>

                        {/* Right Column - Stats */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 md:space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <StatsCard
                                    title="Pruebas Completadas"
                                    value={stats.total.toLocaleString()}
                                    icon="📊"
                                    loading={loading}
                                    color="from-blue-500/20 to-blue-500/5"
                                    textColor="text-blue-400"
                                />
                                <StatsCard
                                    title="Velocidad Máxima"
                                    value={`${stats.maxSpeed.toFixed(2)}`}
                                    unit="Mbps"
                                    icon="⚡"
                                    loading={loading}
                                    color="from-purple-500/20 to-purple-500/5"
                                    textColor="text-purple-400"
                                />
                            </div>

                            {/* Average Speed Card */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="glow-border rounded-xl p-8 bg-gradient-to-br from-green-500/15 to-emerald-500/5 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">📈 Velocidad Promedio</h3>
                                        <p className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                            {stats.avgSpeed.toFixed(2)}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">Mbps Global</p>
                                    </div>
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="text-6xl opacity-20"
                                    >
                                        📊
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* User Results */}
                            {results && (
                                <motion.div
                                    id="user-results"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={highlightResults ? {
                                        scale: 1,
                                        opacity: 1,
                                        boxShadow: [
                                            '0 0 20px rgba(59, 130, 246, 0)',
                                            '0 0 40px rgba(59, 130, 246, 0.6)',
                                            '0 0 20px rgba(59, 130, 246, 0)'
                                        ]
                                    } : { scale: 1, opacity: 1 }}
                                    transition={highlightResults ? {
                                        duration: 0.6,
                                        repeat: 3,
                                        ease: 'easeInOut'
                                    } : { duration: 0.5 }}
                                    className={`glow-border rounded-xl p-8 backdrop-blur-sm transition-all duration-300 ${highlightResults
                                        ? 'bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/10 shadow-2xl shadow-blue-500/40 border-blue-400/50'
                                        : 'bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-transparent hover:shadow-lg hover:shadow-blue-500/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <motion.span
                                            className="text-3xl"
                                            animate={highlightResults ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                                            transition={highlightResults ? { duration: 0.6, repeat: 3 } : {}}
                                        >
                                            ✅
                                        </motion.span>
                                        <h3 className="text-lg font-semibold text-gray-300">Tu Resultado Actual</h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'DESCARGA', icon: '⬇️', value: results.downloadSpeed, unit: 'Mbps', color: 'from-blue-500', textColor: 'text-blue-400', borderColor: 'border-blue-500/50' },
                                            { label: 'SUBIDA', icon: '⬆️', value: results.uploadSpeed, unit: 'Mbps', color: 'from-green-500', textColor: 'text-green-400', borderColor: 'border-green-500/50' },
                                            { label: 'PING', icon: '📡', value: results.ping, unit: 'ms', color: 'from-yellow-500', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/50' },
                                        ].map((metric, idx) => (
                                            <motion.div
                                                key={metric.label}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`text-center bg-gradient-to-br ${metric.color}/10 to-transparent rounded-lg p-4 border-2 ${metric.borderColor} hover:shadow-lg transition-all duration-300`}
                                            >
                                                <p className="text-2xl mb-2">{metric.icon}</p>
                                                <p className="text-gray-400 text-xs font-semibold mb-2">{metric.label}</p>
                                                <p className={`text-3xl font-black ${metric.textColor}`}>
                                                    {metric.value.toFixed(metric.label === 'PING' ? 0 : 1)}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1">{metric.unit}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                                        {results.stability && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold mb-2">Estabilidad</p>
                                                <p className="text-2xl font-bold text-emerald-400">{results.stability.toFixed(0)}%</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-gray-400 font-semibold mb-2">Jitter</p>
                                            <p className="text-2xl font-bold text-cyan-400">{results.jitter.toFixed(1)}ms</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Features Section */}
                    <FeaturesSection />

                    {/* Test History Display */}
                    <TestHistoryDisplay />

                    {/* User Badges Display */}
                    <UserBadgesDisplay />

                    {/* Ranking Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <RankingTable />
                    </motion.div>
                </div>

                <Footer />
            </div>
        </main>
    )
}

interface StatsCardProps {
    title: string
    value: string
    unit?: string
    icon: string
    loading?: boolean
    color?: string
    textColor?: string
}

function StatsCard({
    title,
    value,
    unit,
    icon,
    loading = false,
    color = 'from-white/10 to-white/5',
    textColor = 'text-white'
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className={`glow-border rounded-xl p-6 bg-gradient-to-br ${color} hover:shadow-lg transition-all duration-300 group`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{title}</p>
                    {loading ? (
                        <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse"></div>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <p className={`text-4xl md:text-5xl font-black ${textColor}`}>{value}</p>
                            {unit && <span className="text-gray-400 text-sm font-semibold">{unit}</span>}
                        </div>
                    )}
                </div>
                <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity"
                >
                    {icon}
                </motion.div>
            </div>
        </motion.div>
    )
}

function FeaturesSection() {
    const features = [
        {
            icon: '⚡',
            title: 'Preciso con Cloudflare',
            description: 'Mediciones ultra precisas con 1GB de datos y servidores globales'
        },
        {
            icon: '🏆',
            title: 'Ranking 10,000+',
            description: 'Compite contra los mejores. Top 10,000 usuarios en tiempo real'
        },
        {
            icon: '🛡️',
            title: 'Anti-Fraude Automático',
            description: 'Detección inteligente rechaza resultados sospechosos'
        },
        {
            icon: '🏅',
            title: '12+ Badges Desbloqueables',
            description: 'Speedster Extremo, Gaming Beast, Stability King y más'
        }
    ]

    return (
        <section className="my-12 md:my-16 py-10 md:py-12 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 border border-white/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-10 md:space-y-12"
            >
                <div className="text-center px-4">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent">
                        Por qué WifiTOP
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto px-4">
                        La única plataforma con fraude detection, ranking verificado y badges únicos
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05, translateY: -5 }}
                            className="bg-gradient-to-br from-white/5 to-transparent rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
                        >
                            <p className="text-4xl mb-4">{feature.icon}</p>
                            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}
