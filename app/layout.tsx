import type { Metadata, Viewport } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wifitop.onrender.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WifiTOP'

export const metadata: Metadata = {
  title: `${siteName} - Presume tu velocidad de WiFi`,
  description: 'Speedtest ultra preciso con ranking global. Mide descarga, subida, ping y jitter. Compite con 10,000+ usuarios.',
  keywords: ['speedtest', 'wifi', 'velocidad', 'internet', 'ranking'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Presume tu velocidad de WiFi`,
    description: 'Speedtest ultra preciso con ranking global.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - Presume tu velocidad de WiFi`,
    description: 'Speedtest ultra preciso con ranking global.',
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
