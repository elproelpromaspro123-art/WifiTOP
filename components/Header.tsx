'use client'

import { useLanguage } from '@/hooks/useLanguage'

export default function Header() {
  const { t, language, changeLanguage, languages } = useLanguage()

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
          <p className="text-xs text-gray-400">{t('app.subtitle')}</p>
        </div>

        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value as any)}
          className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-gray-900">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
