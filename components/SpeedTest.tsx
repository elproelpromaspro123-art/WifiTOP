'use client'

import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { runSpeedTest, SpeedTestResult } from '@/lib/speedtest'

interface Props {
  onComplete: (result: SpeedTestResult) => void
}

export default function SpeedTest({ onComplete }: Props) {
  const { t } = useLanguage()
  const [userName, setUserName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [testing, setTesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const handleStart = async () => {
    if (!anonymous && !userName.trim()) {
      setError(t('test.enterName'))
      return
    }

    setError('')
    setTesting(true)
    setProgress(0)
    setStatus(t('test.testing'))

    try {
      const result = await runSpeedTest((p, s) => {
        setProgress(p)
        setStatus(s)
      })

      if (!anonymous) {
        await fetch('/api/speedtest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName: userName.trim(), testResult: result }),
        })
      }

      onComplete(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la prueba')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Speed Test</h2>

      {!testing ? (
        <div className="space-y-4">
          <input
            type="text"
            placeholder={t('test.enterName')}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={anonymous}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 outline-none disabled:opacity-50"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-400">{t('test.anonymous')}</span>
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold hover:opacity-90 transition"
          >
            🚀 {t('test.start')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-gray-300">{status}</p>
          <p className="text-center text-2xl font-bold text-blue-400">{progress}%</p>
        </div>
      )}
    </div>
  )
}
