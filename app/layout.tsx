import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wifitop.vercel.app'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WifiTOP'

export const metadata: Metadata = {
    title: `${siteName} - Presume tu velocidad de WiFi`,
    description: '🚀 Speedtest ultra preciso con ranking global de 10,000+ usuarios. Mide descarga, subida, ping y jitter. Desbloquea badges exclusivos y demuestra que tienes la mejor conexión.',
    keywords: ['speedtest', 'wifi', 'velocidad', 'internet', 'ranking', 'speed test', 'internet speed', 'connection test'],
    authors: [{ name: 'WifiTOP Team' }],
    openGraph: {
        type: 'website',
        locale: 'es_ES',
        url: siteUrl,
        siteName: siteName,
        title: `${siteName} - 🚀 Presume tu velocidad de WiFi`,
        description: '⚡ Speedtest ultra preciso con ranking global. Mide descarga, subida, ping y jitter. ¡Compite con 10,000+ usuarios!',
        images: [
            {
                url: `${siteUrl}/og-image.png`,
                width: 1200,
                height: 630,
                alt: 'WifiTOP - Speedtest Global Ranking',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${siteName} - Presume tu velocidad de WiFi 🚀`,
        description: '⚡ Speedtest ultra preciso. Mide descarga, subida, ping, jitter. Ranking global de 10,000+ usuarios.',
        images: [`${siteUrl}/og-image.png`],
        creator: '@WifiTOP',
    },
    robots: 'index, follow',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <meta name="theme-color" content="#0a0a0a" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className="bg-dark-bg text-white">
                {children}
            </body>
        </html>
    )
}
