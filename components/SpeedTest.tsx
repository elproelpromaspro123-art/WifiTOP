'use client'

import { useState, useCallback } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { runSpeedTest, SpeedTestResult, SpeedTestProgress } from '@/lib/speedtest'
import SpeedGauge from './SpeedGauge'
import SpeedChart from './SpeedChart'

interface Props {
  onComplete: (result: SpeedTestResult) => void
}

export default function SpeedTest({ onComplete }: Props) {
  const { t } = useLanguage()
  const [userName, setUserName] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')

  const [progress, setProgress] = useState<SpeedTestProgress>({
    phase: 'idle',
    progress: 0,
    currentSpeed: 0,
    peakSpeed: 0,
    samples: [],
    status: '',
  })

  const [downloadSamples, setDownloadSamples] = useState<number[]>([])
  const [uploadSamples, setUploadSamples] = useState<number[]>([])
  const [finalResult, setFinalResult] = useState<SpeedTestResult | null>(null)

  const handleProgress = useCallback((p: SpeedTestProgress) => {
    setProgress(p)

    if (p.phase === 'download' && p.samples.length > 0) {
      setDownloadSamples([...p.samples])
    } else if (p.phase === 'upload' && p.samples.length > 0) {
      setUploadSamples([...p.samples])
    }
  }, [])

  const handleStart = async () => {
    if (!anonymous && !userName.trim()) {
      setError(t('test.enterName'))
      return
    }

    setError('')
    setTesting(true)
    setFinalResult(null)
    setDownloadSamples([])
    setUploadSamples([])
    setProgress({
      phase: 'idle',
      progress: 0,
      currentSpeed: 0,
      peakSpeed: 0,
      samples: [],
      status: 'Iniciando...',
    })

    try {
      const result = await runSpeedTest(handleProgress)
      setFinalResult(result)

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

  const getPhaseLabel = () => {
    switch (progress.phase) {
      case 'ping': return 'PING'
      case 'download': return 'DESCARGA'
      case 'upload': return 'SUBIDA'
      case 'complete': return 'COMPLETADO'
      default: return ''
    }
  }

  const getGaugeSpeed = () => {
    if (progress.phase === 'ping') return progress.currentSpeed
    return progress.currentSpeed
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/5">
        <h2 className="text-xl font-bold text-white">Speed Test</h2>
        <p className="text-sm text-gray-400">Test profesional de velocidad</p>
      </div>

      <div className="p-6">
        {!testing && !finalResult ? (
          // Estado inicial - Formulario
          <div className="space-y-6">
            <div className="flex justify-center py-8">
              <div className="relative">
                <SpeedGauge speed={0} phase="idle" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Listo para iniciar</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={t('test.enterName')}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={anonymous}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                           outline-none transition-all disabled:opacity-50"
                />
              </div>

              <label 
                onClick={() => setAnonymous(!anonymous)}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                <div 
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                              ${anonymous ? 'bg-blue-500 border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}
                >
                  {anonymous && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {t('test.anonymous')} <span className="text-gray-500">(no se guardará en el ranking)</span>
                </span>
              </label>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleStart}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 
                         hover:from-blue-500 hover:to-blue-400
                         rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25
                         hover:shadow-blue-500/40 hover:scale-[1.02]
                         active:scale-[0.98] transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">▶</span>
                  INICIAR TEST
                </span>
              </button>
            </div>

            {/* Info */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: '📡', label: 'Ping', desc: 'Latencia' },
                { icon: '⬇️', label: 'Download', desc: 'Descarga' },
                { icon: '⬆️', label: 'Upload', desc: 'Subida' },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 rounded-lg bg-white/5">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : testing ? (
          // Estado de prueba - En progreso
          <div className="space-y-6">
            {/* Velocímetro principal */}
            <div className="flex justify-center">
              <SpeedGauge
                speed={getGaugeSpeed()}
                phase={progress.phase}
                label={getPhaseLabel()}
              />
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{progress.status}</span>
                <span className="text-white font-mono">{progress.progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    progress.phase === 'ping'
                      ? 'bg-yellow-500'
                      : progress.phase === 'download'
                      ? 'bg-blue-500'
                      : progress.phase === 'upload'
                      ? 'bg-green-500'
                      : 'bg-purple-500'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>

            {/* Gráficas en tiempo real */}
            {progress.phase === 'download' && downloadSamples.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Descarga en tiempo real
                </p>
                <SpeedChart samples={downloadSamples} phase="download" />
              </div>
            )}

            {progress.phase === 'upload' && uploadSamples.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Subida en tiempo real
                </p>
                <SpeedChart samples={uploadSamples} phase="upload" />
              </div>
            )}

            {/* Estadísticas en vivo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase">Velocidad Actual</p>
                <p className={`text-2xl font-bold ${
                  progress.phase === 'download' ? 'text-blue-400' : 
                  progress.phase === 'upload' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {progress.currentSpeed.toFixed(1)} <span className="text-sm font-normal">Mbps</span>
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase">Pico Máximo</p>
                <p className="text-2xl font-bold text-white">
                  {progress.peakSpeed.toFixed(1)} <span className="text-sm font-normal">Mbps</span>
                </p>
              </div>
            </div>
          </div>
        ) : finalResult ? (
          // Estado completado - Resultados
          <div className="space-y-6">
            {/* Velocímetro con resultado final */}
            <div className="flex justify-center">
              <SpeedGauge
                speed={finalResult.downloadSpeed}
                phase="complete"
                label="DESCARGA"
              />
            </div>

            {/* Resultados principales */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-4 text-center border border-blue-500/20">
                <p className="text-3xl">⬇️</p>
                <p className="text-xs text-gray-400 mt-2 uppercase">Descarga</p>
                <p className="text-2xl font-bold text-blue-400">{finalResult.downloadSpeed.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Mbps</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-4 text-center border border-green-500/20">
                <p className="text-3xl">⬆️</p>
                <p className="text-xs text-gray-400 mt-2 uppercase">Subida</p>
                <p className="text-2xl font-bold text-green-400">{finalResult.uploadSpeed.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Mbps</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-xl p-4 text-center border border-yellow-500/20">
                <p className="text-3xl">📡</p>
                <p className="text-xs text-gray-400 mt-2 uppercase">Ping</p>
                <p className="text-2xl font-bold text-yellow-400">{finalResult.ping.toFixed(0)}</p>
                <p className="text-xs text-gray-500">ms</p>
              </div>
            </div>

            {/* Detalles adicionales */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">Jitter</span>
                <span className="text-sm font-medium text-cyan-400">{finalResult.jitter.toFixed(1)} ms</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">Estabilidad</span>
                <span className="text-sm font-medium text-emerald-400">{finalResult.stability.toFixed(0)}%</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">Pico ↓</span>
                <span className="text-sm font-medium text-blue-400">{finalResult.peakDownload.toFixed(1)} Mbps</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">Pico ↑</span>
                <span className="text-sm font-medium text-green-400">{finalResult.peakUpload.toFixed(1)} Mbps</span>
              </div>
            </div>

            {/* Tipo de conexión */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tipo de conexión detectada</p>
                  <p className="text-lg font-bold text-white capitalize">
                    {finalResult.connectionType === 'fiber' ? '🔷 Fibra Óptica' :
                     finalResult.connectionType === 'ethernet' ? '🔌 Ethernet/Cable' :
                     finalResult.connectionType === 'wifi' ? '📶 WiFi' :
                     finalResult.connectionType === 'cable' ? '📺 Cable/DOCSIS' :
                     finalResult.connectionType === 'dsl' ? '📞 DSL' :
                     finalResult.connectionType === 'mobile' ? '📱 Móvil' : '❓ Desconocido'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Simetría</p>
                  <p className={`text-sm font-medium ${finalResult.isSymmetric ? 'text-green-400' : 'text-yellow-400'}`}>
                    {finalResult.isSymmetric ? '✓ Simétrica' : '↕ Asimétrica'}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráficas finales */}
            {downloadSamples.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Historial de Descarga</p>
                <SpeedChart samples={downloadSamples} phase="download" />
              </div>
            )}

            {uploadSamples.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Historial de Subida</p>
                <SpeedChart samples={uploadSamples} phase="upload" />
              </div>
            )}

            {/* Botón de repetir */}
            <button
              onClick={() => {
                setFinalResult(null)
                setDownloadSamples([])
                setUploadSamples([])
                setProgress({ phase: 'idle', progress: 0, currentSpeed: 0, peakSpeed: 0, samples: [], status: '' })
              }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
            >
              🔄 Realizar otro test
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
