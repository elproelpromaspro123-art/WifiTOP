'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Header() {
  const [activeLink, setActiveLink] = useState('home')

  const navLinks = [
    { id: 'home', label: '🏠 Inicio', href: '/' },
    { id: 'ranking', label: '🏆 Ranking', href: '#ranking' },
    { id: 'about', label: 'ℹ️ Acerca de', href: '#about' },
  ]

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
      <nav className="relative container mx-auto px-3 md:px-4 py-4 md:py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.3 }}
              className="w-10 md:w-12 h-10 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center group-hover:from-blue-500/50 group-hover:to-purple-500/50 transition-all duration-300 shadow-lg shadow-blue-500/20 flex-shrink-0"
            >
              <span className="text-2xl md:text-3xl">⚡</span>
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-100 via-white to-blue-200 bg-clip-text text-transparent tracking-tight">
                WifiTOP
              </h1>
              <p className="text-xs text-gray-400 font-semibold tracking-wide hidden sm:block">Speedtest Ranking</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <motion.a
                key={link.id}
                href={link.href}
                onClick={() => setActiveLink(link.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 lg:px-4 py-2 rounded-lg font-semibold text-sm lg:text-base transition-all duration-300 ${
                  activeLink === link.id
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="text-xl">☰</span>
          </motion.button>
        </div>
      </nav>
    </header>
  )
}
