'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="glow-border border-b-0 border-l-0 border-r-0 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">🏠 Inicio</a></li>
              <li><a href="#ranking" className="text-gray-400 hover:text-white transition-colors">🏆 Ranking</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">⚙️ API</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">🔒 Privacidad</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">📋 Términos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">🍪 Cookies</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">𝕏 Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">📷 Instagram</a></li>
              <li><a href="https://github.com/elproelpromaspro123-art/WifiTOP" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">💻 GitHub</a></li>
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
