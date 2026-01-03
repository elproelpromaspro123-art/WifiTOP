'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface FooterLink {
  label: string
  href: string
  icon: string
}

interface FooterSection {
  title: string
  items: string[] | FooterLink[]
  isText?: boolean
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections: FooterSection[] = [
    {
      title: 'WifiTOP ⚡',
      items: [
        'Presume tu velocidad de WiFi y compite en el ranking mundial',
        'Prueba precisa, resultados confiables y competencia global'
      ],
      isText: true
    },
    {
      title: 'Navegación',
      items: [
        { label: '🏠 Inicio', href: '/', icon: 'home' },
        { label: '🏆 Ranking', href: '#ranking', icon: 'ranking' },
        { label: '⚡ Prueba', href: '#', icon: 'test' },
        { label: '📊 Estadísticas', href: '#', icon: 'stats' }
      ],
      isText: false
    },
    {
      title: 'Información',
      items: [
        { label: 'ℹ️ Acerca de', href: '#about', icon: 'about' },
        { label: '🔒 Privacidad', href: '#', icon: 'privacy' },
        { label: '📋 Términos', href: '#', icon: 'terms' },
        { label: '📧 Contacto', href: '#', icon: 'contact' }
      ],
      isText: false
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <footer className="mt-20 border-t border-white/10 bg-gradient-to-t from-black/50 to-transparent">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
        >
          {footerSections.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h3 className="font-black text-lg mb-6 bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent">
                {section.title}
              </h3>
              
              {section.isText ? (
                <div className="space-y-3">
                  {(section.items as string[]).map((item, i) => (
                    <p key={i} className="text-gray-400 text-sm leading-relaxed hover:text-gray-200 transition-colors">
                      {item}
                    </p>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {(section.items as FooterLink[]).map((item, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        className="text-gray-400 hover:text-blue-400 transition-colors text-sm font-medium inline-flex items-center gap-2 group"
                      >
                        <span className="group-hover:scale-125 transition-transform">{item.label.split(' ')[0]}</span>
                        {item.label.split(' ').slice(1).join(' ')}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}

          {/* Stats Box */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20 col-span-1"
          >
            <h3 className="font-black text-lg mb-6 text-white">Comunidad</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs font-semibold mb-2">Usuarios Activos</p>
                <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">1000+</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-gray-400 text-xs font-semibold mb-2">Pruebas Completadas</p>
                <p className="text-2xl font-bold text-green-400">5M+</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8"></div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <p className="text-gray-400 text-sm">
              © {currentYear} <span className="font-bold text-white">WifiTOP</span>. Todos los derechos reservados.
            </p>
          </div>
          
          <motion.p
            whileHover={{ scale: 1.05 }}
            className="text-gray-400 text-sm bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            Hecho con 💙 para los amantes de la velocidad
          </motion.p>
        </motion.div>
      </div>
    </footer>
  )
}
