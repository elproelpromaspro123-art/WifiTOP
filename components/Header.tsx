'use client'

import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export default function Header() {
  const { t, language, changeLanguage, languages } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('app.title')}
              </h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">{t('app.subtitle')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#test" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Test
            </a>
            <a href="#ranking" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Ranking
            </a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              ¿Cómo funciona?
            </a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value as any)}
                className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 pr-8 text-sm font-medium transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-blue-500/50"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-gray-900 text-white">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 border-t border-white/10 pt-4 space-y-2 animate-fade-in">
            <a href="#test" className="block px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Test
            </a>
            <a href="#ranking" className="block px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Ranking
            </a>
            <a href="#how-it-works" className="block px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              ¿Cómo funciona?
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}
