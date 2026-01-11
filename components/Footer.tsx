'use client'

import Link from 'next/link'

export default function Footer() {
  const footerLinks = [
    { 
      title: 'Producto', 
      links: [
        { name: 'Speedtest', href: '/#test' },
        { name: 'Ranking Global', href: '/#ranking' },
        { name: 'Badges', href: '/badges' },
      ] 
    },
    { 
      title: 'Soporte', 
      links: [
        { name: 'FAQ', href: '/faq' },
      ] 
    },
    { 
      title: 'Legal', 
      links: [
        { name: 'Privacidad', href: '/privacidad' },
        { name: 'Términos', href: '/terminos' },
      ] 
    },
  ]

  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                WifiTOP
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              El test de velocidad más preciso del mundo. Mide tu conexión a Internet y compite en el ranking global con usuarios de todo el mundo.
            </p>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} WifiTOP. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Hecho con</span>
              <svg className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>por el equipo WifiTOP</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Sistemas operativos
              </span>
              <span>v2.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
