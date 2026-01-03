'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="glow-border border-b-0 border-l-0 border-r-0 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-black text-lg mb-4 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              WifiTOP ⚡
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Presume tu velocidad de WiFi y compite en el ranking mundial
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">🏠 Inicio</a></li>
              <li><a href="#ranking" className="text-gray-400 hover:text-white transition-colors">🏆 Ranking Global</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">📊 Tu Resultado</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold mb-4">Información</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">ℹ️ Acerca de</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">🔒 Privacidad</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">📋 Términos</a></li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between"
        >
          <p className="text-gray-400 text-sm">
            © {currentYear} <span className="font-bold">WifiTOP</span>. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            Hecho con 💙 para los amantes de la velocidad
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
