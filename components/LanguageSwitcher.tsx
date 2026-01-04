'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export default function LanguageSwitcher() {
  const { language, changeLanguage, availableLanguages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = availableLanguages.find(l => l.code === language)

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-colors"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="hidden sm:inline">{currentLang?.code.toUpperCase()}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 z-50 bg-gradient-to-br from-slate-900 to-black border border-white/20 rounded-xl overflow-hidden shadow-xl"
            >
              {availableLanguages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={() => {
                    changeLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    language === lang.code
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-xs text-gray-400">{lang.code.toUpperCase()}</div>
                  </div>
                  {language === lang.code && (
                    <span className="ml-auto text-blue-400">✓</span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
