'use client'

import { useState, useEffect, useCallback } from 'react'
import { Language, detectLanguage, t as translate } from '@/lib/i18n'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('wifitop_lang') as Language | null
    const lang = saved || detectLanguage()
    setLanguage(lang)
    setIsLoaded(true)
  }, [])

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('wifitop_lang', lang)
  }, [])

  const t = useCallback((key: string) => translate(key, language), [language])

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
    { code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  ]

  return { language, isLoaded, changeLanguage, t, languages }
}
