'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { SpeedTestResult } from '@/lib/speedtest'

interface Props {
  result: SpeedTestResult
}

export default function Results({ result }: Props) {
  const { t } = useLanguage()

  return (
    <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="text-xl">✅</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Test Completado</h3>
          <p className="text-sm text-gray-400">Resultados guardados</p>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <p className="text-xs text-blue-400 uppercase font-medium">Descarga</p>
          <p className="text-2xl font-bold text-white">{result.downloadSpeed.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Mbps</p>
        </div>

        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
          <p className="text-xs text-green-400 uppercase font-medium">Subida</p>
          <p className="text-2xl font-bold text-white">{result.uploadSpeed.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Mbps</p>
        </div>

        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
          <p className="text-xs text-yellow-400 uppercase font-medium">Ping</p>
          <p className="text-2xl font-bold text-white">{result.ping.toFixed(0)}</p>
          <p className="text-xs text-gray-500">ms</p>
        </div>

        <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
          <p className="text-xs text-purple-400 uppercase font-medium">Estabilidad</p>
          <p className="text-2xl font-bold text-white">{result.stability.toFixed(0)}</p>
          <p className="text-xs text-gray-500">%</p>
        </div>
      </div>

      {/* Detalles técnicos */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-gray-400">Jitter</span>
          <span className="text-cyan-400 font-medium">{result.jitter.toFixed(1)} ms</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-gray-400">Pico de descarga</span>
          <span className="text-blue-400 font-medium">{result.peakDownload.toFixed(1)} Mbps</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-gray-400">Pico de subida</span>
          <span className="text-green-400 font-medium">{result.peakUpload.toFixed(1)} Mbps</span>
        </div>
        <div className="flex justify-between py-2 border-b border-white/5">
          <span className="text-gray-400">Tipo de conexión</span>
          <span className="text-white font-medium capitalize">
            {result.connectionType === 'fiber' ? 'Fibra Óptica' :
             result.connectionType === 'ethernet' ? 'Ethernet/Cable' :
             result.connectionType === 'wifi' ? 'WiFi' :
             result.connectionType === 'cable' ? 'Cable/DOCSIS' :
             result.connectionType === 'dsl' ? 'DSL' :
             result.connectionType === 'mobile' ? 'Móvil' : 'Desconocido'}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-400">Simetría</span>
          <span className={`font-medium ${result.isSymmetric ? 'text-green-400' : 'text-yellow-400'}`}>
            {result.isSymmetric ? 'Simétrica' : 'Asimétrica'}
          </span>
        </div>
      </div>
    </div>
  )
}
