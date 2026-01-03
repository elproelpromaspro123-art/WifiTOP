import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wifitop.vercel.app'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WifiTOP'

export const metadata: Metadata = {
  title: `${siteName} - Presume tu velocidad de WiFi`,
  description: 'Prueba la velocidad de tu WiFi y compite en el ranking mundial. Descubre qué tan rápida es tu conexión.',
  keywords: ['speedtest', 'wifi', 'velocidad', 'internet', 'ranking'],
  authors: [{ name: 'WifiTOP Team' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Presume tu velocidad de WiFi`,
    description: 'Prueba la velocidad de tu WiFi y compite en el ranking mundial',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'WifiTOP - Speedtest',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - Presume tu velocidad de WiFi`,
    description: 'Prueba la velocidad de tu WiFi y compite en el ranking mundial',
    images: [`${siteUrl}/og-image.png`],
  },
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
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
