'use client'

interface TestMetric {
  label: string
  value: number
  unit: string
  icon: string
  color: string
  min?: number
  max?: number
}

interface SpeedTestVisualizationProps {
  metrics: TestMetric[]
  progress: number
  status: string
  isRunning: boolean
}

export default function SpeedTestVisualization({
  metrics,
  progress,
  status,
  isRunning,
}: SpeedTestVisualizationProps) {
  const getGaugeColor = (value: number, max: number) => {
    const percentage = (value / max) * 100
    if (percentage >= 80) return 'from-green-500 to-emerald-500'
    if (percentage >= 50) return 'from-yellow-500 to-amber-500'
    if (percentage >= 20) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-rose-500'
  }

  const CircularProgress = ({ metric }: { metric: TestMetric }) => {
    const circumference = 2 * Math.PI * 45
    const percentage = metric.max ? (metric.value / metric.max) * 100 : 0
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          <svg className="absolute inset-0 transform -rotate-90" width="112" height="112">
            <circle
              cx="56"
              cy="56"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="56"
              cy="56"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-white">{metric.value.toFixed(1)}</p>
            <p className="text-xs text-gray-400">{metric.unit}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-300 font-semibold">{metric.label}</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* Barra de progreso mejorada */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-300">{status}</p>
          <p className="text-sm font-bold text-blue-400">{Math.round(progress)}%</p>
        </div>
        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full shadow-lg shadow-blue-500/50 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute inset-0 opacity-0 animate-pulse"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
      </div>

      {/* Métricas en tiempo real */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-4 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="text-3xl mb-2">{metric.icon}</div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">{metric.label}</p>
            <div className="flex items-baseline gap-1">
              <p className={`text-2xl font-bold bg-gradient-to-r ${getGaugeColor(metric.value, metric.max || 100)} bg-clip-text text-transparent`}>
                {metric.value.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">{metric.unit}</p>
            </div>
            {metric.max && (
              <p className="text-xs text-gray-500 mt-1">
                {((metric.value / metric.max) * 100).toFixed(0)}% del máximo
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Gráfico de velocidad instantánea (opcional) */}
      {isRunning && (
        <div className="p-4 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
          <p className="text-xs text-gray-400 font-semibold mb-3">VELOCIDAD INSTANTÁNEA</p>
          <div className="h-16 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute h-full w-0.5 bg-gradient-to-t from-transparent to-blue-500"
                  style={{
                    left: `${i * 5}%`,
                    animation: `wave 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <p className="relative text-sm text-gray-300">Midiendo...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes wave {
          0%,
          100% {
            height: 10%;
          }
          50% {
            height: 100%;
          }
        }
      `}</style>
    </div>
  )
}
