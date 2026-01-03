'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ValidationErrorProps {
  message: string | null
  type?: 'error' | 'warning' | 'success'
  autoClose?: number
  onClose?: () => void
}

const colors = {
  error: 'border-red-500/30 bg-red-500/10 text-red-200',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
  success: 'border-green-500/30 bg-green-500/10 text-green-200',
}

const icons = {
  error: '❌',
  warning: '⚠️',
  success: '✅',
}

export default function ValidationError({
  message,
  type = 'error',
  autoClose = 5000,
  onClose,
}: ValidationErrorProps) {
  const [isVisible, setIsVisible] = useState(!!message)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, autoClose)
        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [message, autoClose, onClose])

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`rounded-lg p-3 mb-4 border flex items-center gap-3 ${colors[type]}`}
        >
          <span className="text-lg flex-shrink-0">{icons[type]}</span>
          <span className="flex-1 text-sm">{message}</span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-lg hover:opacity-70 transition flex-shrink-0"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
