'use client'

import { useState, useEffect, useCallback } from 'react'
import { Language, detectBrowserLanguage, t, translations } from '@/lib/i18n'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // Detectar idioma del navegador al montar
  useEffect(() => {
    const detectedLang = detectBrowserLanguage()
    const savedLang = localStorage.getItem('wifitop_language') as Language | null

    const finalLanguage = savedLang || detectedLang
    setLanguage(finalLanguage)
    setIsLoaded(true)
  }, [])

  // Cambiar idioma y guardar en localStorage
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('wifitop_language', newLanguage)
  }, [])

  // Obtener traducción
  const translate = useCallback((key: string): string => {
    return t(key, language)
  }, [language])

  // Obtener todos los idiomas disponibles
  const availableLanguages: Array<{ code: Language; name: string; flag: string }> = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ]

  return {
    language,
    isLoaded,
    changeLanguage,
    translate,
    t: translate,
    availableLanguages,
  }
}
