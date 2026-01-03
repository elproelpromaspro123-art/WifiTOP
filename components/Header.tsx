'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <header className="glow-border border-b border-t-0 border-l-0 border-r-0">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all"
            >
              <span className="text-3xl">⚡</span>
            </motion.div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                WifiTOP
              </h1>
              <p className="text-xs text-gray-400 font-semibold">Speedtest Ranking Global</p>
            </div>
          </Link>

          <div className="flex items-center space-x-8">
            <motion.a 
              href="#ranking"
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-white transition-colors font-semibold"
            >
              🏆 Ranking
            </motion.a>
            <motion.a 
              href="https://github.com/elproelpromaspro123-art/WifiTOP" 
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="text-gray-300 hover:text-white transition-colors font-semibold"
            >
              💻 GitHub
            </motion.a>
          </div>
        </div>
      </nav>
    </header>
  )
}
