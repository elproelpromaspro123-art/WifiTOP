'use client'

import { motion } from 'framer-motion'

interface ShareButtonsProps {
    downloadSpeed: number
    uploadSpeed: number
    ping: number
    userName: string
}

export default function ShareButtons({
    downloadSpeed,
    uploadSpeed,
    ping,
    userName
}: ShareButtonsProps) {
    const wifiTopUrl = 'https://wifi-top.vercel.app/'

    const generateShareText = () => {
        const userDisplay = userName && userName !== 'Usuario' ? ` - ${userName}` : ''
        return `🚀 ¡Acabo de probar mi WiFi en WifiTOP!${userDisplay}\n⬇️ Descarga: ${downloadSpeed.toFixed(1)} Mbps\n⬆️ Subida: ${uploadSpeed.toFixed(1)} Mbps\n📡 Ping: ${ping.toFixed(0)}ms\n\n¿Quieres competir en el ranking global?\n${wifiTopUrl}\n#WifiTOP #SpeedTest #InternetSpeed`
    }

    const generateShortShareText = () => {
        const userDisplay = userName && userName !== 'Usuario' ? ` (${userName})` : ''
        return `Mis resultados en WifiTOP${userDisplay}: ⬇️ ${downloadSpeed.toFixed(1)} Mbps | ⬆️ ${uploadSpeed.toFixed(1)} Mbps | 📡 ${ping.toFixed(0)}ms\n${wifiTopUrl}\n#WifiTOP`
    }

    const shareText = generateShareText()
    const shortShareText = generateShortShareText()
    const encodedLongText = encodeURIComponent(shareText)
    const encodedShortText = encodeURIComponent(shortShareText)
    const baseUrl = wifiTopUrl

    const handleShare = (platform: 'twitter' | 'whatsapp' | 'facebook') => {
        let url = ''
        switch (platform) {
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodedShortText}&url=${encodeURIComponent(baseUrl)}`
                break
            case 'whatsapp':
                url = `https://wa.me/?text=${encodedLongText}`
                break
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}&quote=${encodedShortText}`
                break
        }
        if (url) {
            window.open(url, '_blank', 'width=600,height=400')
        }
    }

    return (
        <div className="w-full pointer-events-auto relative z-10" style={{ pointerEvents: 'auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 md:gap-3 justify-center flex-wrap pointer-events-auto relative z-10"
                style={{ pointerEvents: 'auto' }}
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('twitter')}
                    className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border border-blue-400/30 text-white font-bold text-sm md:text-base transition-all cursor-pointer shadow-lg hover:shadow-xl shadow-blue-500/30 pointer-events-auto backdrop-blur-sm"
                    style={{ pointerEvents: 'auto' }}
                >
                    𝕏 Twitter
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 border border-green-400/30 text-white font-bold text-sm md:text-base transition-all cursor-pointer shadow-lg hover:shadow-xl shadow-green-500/30 pointer-events-auto backdrop-blur-sm"
                    style={{ pointerEvents: 'auto' }}
                >
                    💬 WhatsApp
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('facebook')}
                    className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 border border-blue-400/30 text-white font-bold text-sm md:text-base transition-all cursor-pointer shadow-lg hover:shadow-xl shadow-blue-600/30 pointer-events-auto backdrop-blur-sm"
                    style={{ pointerEvents: 'auto' }}
                >
                    f Facebook
                </motion.button>
            </motion.div>
        </div>
    )
}
