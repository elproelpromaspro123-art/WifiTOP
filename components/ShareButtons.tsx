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
  const generateShareText = () => {
    const userDisplay = userName && userName !== 'Usuario' ? ` - ${userName}` : ''
    return `🚀 ¡Acabo de probar mi WiFi en WifiTOP!${userDisplay}\n⬇️ Descarga: ${downloadSpeed.toFixed(1)} Mbps\n⬆️ Subida: ${uploadSpeed.toFixed(1)} Mbps\n📡 Ping: ${ping.toFixed(0)}ms\n\n¿Quieres competir en el ranking global? #WifiTOP #SpeedTest #InternetSpeed`
  }

  const generateShortShareText = () => {
    const userDisplay = userName && userName !== 'Usuario' ? ` (${userName})` : ''
    return `Mis resultados en WifiTOP${userDisplay}: ⬇️ ${downloadSpeed.toFixed(1)} Mbps | ⬆️ ${uploadSpeed.toFixed(1)} Mbps | 📡 ${ping.toFixed(0)}ms #WifiTOP`
  }

  const shareText = generateShareText()
  const shortShareText = generateShortShareText()
  const encodedLongText = encodeURIComponent(shareText)
  const encodedShortText = encodeURIComponent(shortShareText)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 justify-center flex-wrap"
    >
      <button
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white font-bold transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl shadow-blue-500/30"
      >
        𝕏 Twitter
      </button>
      <button
        onClick={() => handleShare('whatsapp')}
        className="flex items-center gap-2 px-5 py-3 rounded-lg bg-green-600 hover:bg-green-500 border border-green-400 text-white font-bold transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl shadow-green-500/30"
      >
        💬 WhatsApp
      </button>
      <button
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-700 hover:bg-blue-600 border border-blue-400 text-white font-bold transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-xl shadow-blue-600/30"
      >
        f Facebook
      </button>
    </motion.div>
  )
}
