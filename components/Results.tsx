'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { SpeedTestResult } from '@/lib/speedtest'

interface Props {
  result: SpeedTestResult
}

export default function Results({ result }: Props) {
  const { t } = useLanguage()

  const metrics = [
    { label: t('test.download'), value: result.downloadSpeed, unit: 'Mbps', color: 'text-blue-400', icon: '⬇️' },
    { label: t('test.upload'), value: result.uploadSpeed, unit: 'Mbps', color: 'text-green-400', icon: '⬆️' },
    { label: t('test.ping'), value: result.ping, unit: 'ms', color: 'text-yellow-400', icon: '📡' },
  ]

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        ✅ {t('test.download')} / {t('test.upload')}
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="text-center bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-2xl mb-2">{m.icon}</p>
            <p className="text-gray-400 text-xs mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>
              {m.value.toFixed(m.unit === 'ms' ? 0 : 1)}
            </p>
            <p className="text-gray-500 text-xs">{m.unit}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-gray-400">{t('test.jitter')}</p>
          <p className="text-xl font-bold text-cyan-400">{result.jitter.toFixed(1)}ms</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">{t('test.stability')}</p>
          <p className="text-xl font-bold text-emerald-400">{result.stability.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  )
}
