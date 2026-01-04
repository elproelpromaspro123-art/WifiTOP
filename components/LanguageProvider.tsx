'use client'

import { ReactNode } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Este componente simplemente inicializa useLanguage para que esté disponible
  // en toda la aplicación cuando se monta
  useLanguage()
  return <>{children}</>
}
