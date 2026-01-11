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
    <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-r from-white/5 via-white/[0.02] to-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Speed Test</h2>
            <p className="text-sm text-gray-400">Test profesional de velocidad</p>
          </div>
        </div>
      </div>

      <div className="relative p-6">
        {!testing && !finalResult ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-center py-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <SpeedGauge speed={0} phase="idle" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm font-medium">Listo para iniciar</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
                <input
                  type="text"
                  placeholder={t('test.enterName')}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={anonymous}
                  className="relative w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 
                           text-white placeholder:text-gray-500
                           focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/20 
                           outline-none transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              <label 
                onClick={() => setAnonymous(!anonymous)}
                className="flex items-center gap-4 cursor-pointer group select-none p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors duration-200"
              >
                <div 
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                              ${anonymous 
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent shadow-lg shadow-blue-500/25' 
                                : 'border-gray-600 group-hover:border-gray-500'}`}
                >
                  {anonymous && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {t('test.anonymous')} <span className="text-gray-500">(no se guardará en el ranking)</span>
                </span>
              </label>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleStart}
                className="relative w-full py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 
                         rounded-xl font-bold text-lg overflow-hidden group
                         shadow-xl shadow-blue-500/25
                         hover:shadow-blue-500/40 hover:scale-[1.02]
                         active:scale-[0.98] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">▶</span>
                  INICIAR TEST
                </span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { icon: '📡', label: 'Ping', desc: 'Latencia', color: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20' },
                { icon: '⬇️', label: 'Download', desc: 'Descarga', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20' },
                { icon: '⬆️', label: 'Upload', desc: 'Subida', color: 'from-green-500/20 to-green-500/5 border-green-500/20' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`text-center p-4 rounded-xl bg-gradient-to-br ${item.color} border backdrop-blur-sm
                             hover:scale-105 transition-transform duration-300 cursor-default`}
                >
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : testing ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-30 transition-colors duration-500 ${
                  progress.phase === 'ping' ? 'bg-yellow-500' :
                  progress.phase === 'download' ? 'bg-blue-500' :
                  progress.phase === 'upload' ? 'bg-green-500' : 'bg-purple-500'
                }`} />
                <SpeedGauge
                  speed={getGaugeSpeed()}
                  phase={progress.phase}
                  label={getPhaseLabel()}
                />
              </div>
            </div>

            <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">{progress.status}</span>
                <span className="text-white font-mono font-bold">{progress.progress.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-gray-800/80 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-300 rounded-full relative overflow-hidden ${
                    progress.phase === 'ping'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                      : progress.phase === 'download'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                      : progress.phase === 'upload'
                      ? 'bg-gradient-to-r from-green-600 to-green-400'
                      : 'bg-gradient-to-r from-purple-600 to-purple-400'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
                </div>
              </div>
            </div>

            {progress.phase === 'download' && downloadSamples.length > 1 && (
              <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                  Descarga en tiempo real
                </p>
                <SpeedChart samples={downloadSamples} phase="download" />
              </div>
            )}

            {progress.phase === 'upload' && uploadSamples.length > 1 && (
              <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  Subida en tiempo real
                </p>
                <SpeedChart samples={uploadSamples} phase="upload" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Velocidad Actual</p>
                <p className={`text-3xl font-bold mt-1 ${
                  progress.phase === 'download' ? 'text-blue-400' : 
                  progress.phase === 'upload' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {progress.currentSpeed.toFixed(1)} <span className="text-sm font-normal opacity-70">Mbps</span>
                </p>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pico Máximo</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {progress.peakSpeed.toFixed(1)} <span className="text-sm font-normal opacity-70">Mbps</span>
                </p>
              </div>
            </div>
          </div>
        ) : finalResult ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-3xl" />
                <SpeedGauge
                  speed={finalResult.downloadSpeed}
                  phase="complete"
                  label="DESCARGA"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="group bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent rounded-2xl p-5 text-center border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⬇️</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Descarga</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{finalResult.downloadSpeed.toFixed(1)}</p>
                <p className="text-xs text-gray-500 font-medium">Mbps</p>
              </div>

              <div className="group bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent rounded-2xl p-5 text-center border border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⬆️</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Subida</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{finalResult.uploadSpeed.toFixed(1)}</p>
                <p className="text-xs text-gray-500 font-medium">Mbps</p>
              </div>

              <div className="group bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent rounded-2xl p-5 text-center border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📡</span>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Ping</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{finalResult.ping.toFixed(0)}</p>
                <p className="text-xs text-gray-500 font-medium">ms</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Jitter', value: `${finalResult.jitter.toFixed(1)} ms`, color: 'text-cyan-400' },
                { label: 'Estabilidad', value: `${finalResult.stability.toFixed(0)}%`, color: 'text-emerald-400' },
                { label: 'Pico ↓', value: `${finalResult.peakDownload.toFixed(1)} Mbps`, color: 'text-blue-400' },
                { label: 'Pico ↑', value: `${finalResult.peakUpload.toFixed(1)} Mbps`, color: 'text-green-400' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 hover:bg-white/10 rounded-xl p-4 flex justify-between items-center border border-white/5 hover:border-white/10 transition-all duration-300">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl p-5 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-medium">Tipo de conexión detectada</p>
                  <p className="text-lg font-bold text-white capitalize mt-1">
                    {finalResult.connectionType === 'fiber' ? '🔷 Fibra Óptica' :
                     finalResult.connectionType === 'ethernet' ? '🔌 Ethernet/Cable' :
                     finalResult.connectionType === 'wifi' ? '📶 WiFi' :
                     finalResult.connectionType === 'cable' ? '📺 Cable/DOCSIS' :
                     finalResult.connectionType === 'dsl' ? '📞 DSL' :
                     finalResult.connectionType === 'mobile' ? '📱 Móvil' : '❓ Desconocido'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-medium">Simetría</p>
                  <p className={`text-sm font-bold mt-1 ${finalResult.isSymmetric ? 'text-green-400' : 'text-yellow-400'}`}>
                    {finalResult.isSymmetric ? '✓ Simétrica' : '↕ Asimétrica'}
                  </p>
                </div>
              </div>
            </div>

            {downloadSamples.length > 1 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 font-medium">Historial de Descarga</p>
                <SpeedChart samples={downloadSamples} phase="download" />
              </div>
            )}

            {uploadSamples.length > 1 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 font-medium">Historial de Subida</p>
                <SpeedChart samples={uploadSamples} phase="upload" />
              </div>
            )}

            <button
              onClick={() => {
                setFinalResult(null)
                setDownloadSamples([])
                setUploadSamples([])
                setProgress({ phase: 'idle', progress: 0, currentSpeed: 0, peakSpeed: 0, samples: [], status: '' })
              }}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 
                       rounded-xl font-semibold transition-all duration-300 group"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span>
                Realizar otro test
              </span>
            </button>
          </div>
        ) : null}
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  )
}
