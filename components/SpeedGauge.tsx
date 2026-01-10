'use client'

import { useEffect, useRef } from 'react'

interface Props {
  speed: number
  maxSpeed?: number
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete'
  label?: string
}

export default function SpeedGauge({ speed, maxSpeed = 1000, phase, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animatedSpeed = useRef(0)
  const animationFrame = useRef<number>()

  // Colores por fase
  const phaseColors = {
    idle: { primary: '#6b7280', secondary: '#374151' },
    ping: { primary: '#f59e0b', secondary: '#d97706' },
    download: { primary: '#3b82f6', secondary: '#1d4ed8' },
    upload: { primary: '#10b981', secondary: '#059669' },
    complete: { primary: '#8b5cf6', secondary: '#7c3aed' },
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 280
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 20

    // Escala logarítmica para mejor visualización
    const speedToAngle = (spd: number): number => {
      const maxAngle = 270
      const minAngle = -135
      if (spd <= 0) return minAngle

      // Escala logarítmica
      const logSpeed = Math.log10(spd + 1)
      const logMax = Math.log10(maxSpeed + 1)
      const ratio = Math.min(1, logSpeed / logMax)

      return minAngle + ratio * maxAngle
    }

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // Animación suave de la velocidad
      const targetSpeed = speed
      const diff = targetSpeed - animatedSpeed.current
      animatedSpeed.current += diff * 0.15

      const colors = phaseColors[phase]
      const currentAngle = speedToAngle(animatedSpeed.current)

      // Fondo del arco
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, (Math.PI * 3) / 4, Math.PI / 4, false)
      ctx.strokeStyle = '#1f2937'
      ctx.lineWidth = 20
      ctx.lineCap = 'round'
      ctx.stroke()

      // Arco de progreso con gradiente
      if (animatedSpeed.current > 0) {
        const gradient = ctx.createLinearGradient(0, 0, size, size)
        gradient.addColorStop(0, colors.primary)
        gradient.addColorStop(1, colors.secondary)

        ctx.beginPath()
        ctx.arc(
          centerX,
          centerY,
          radius,
          (Math.PI * 3) / 4,
          ((currentAngle + 135) * Math.PI) / 180 + (Math.PI * 3) / 4,
          false
        )
        ctx.strokeStyle = gradient
        ctx.lineWidth = 20
        ctx.lineCap = 'round'
        ctx.stroke()

        // Glow effect
        ctx.shadowColor = colors.primary
        ctx.shadowBlur = 20
        ctx.beginPath()
        ctx.arc(
          centerX,
          centerY,
          radius,
          (Math.PI * 3) / 4,
          ((currentAngle + 135) * Math.PI) / 180 + (Math.PI * 3) / 4,
          false
        )
        ctx.strokeStyle = colors.primary
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Marcas de escala
      const scales = [0, 10, 50, 100, 250, 500, 1000]
      ctx.font = '10px system-ui'
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      scales.forEach((val) => {
        if (val > maxSpeed) return
        const angle = ((speedToAngle(val) - 90) * Math.PI) / 180
        const tickRadius = radius + 15
        const x = centerX + Math.cos(angle) * tickRadius
        const y = centerY + Math.sin(angle) * tickRadius

        // Pequeña línea de marca
        const innerRadius = radius - 12
        const x1 = centerX + Math.cos(angle) * innerRadius
        const y1 = centerY + Math.sin(angle) * innerRadius
        const x2 = centerX + Math.cos(angle) * (radius - 5)
        const y2 = centerY + Math.sin(angle) * (radius - 5)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = '#4b5563'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // Velocidad actual (número grande)
      ctx.font = 'bold 52px system-ui'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(animatedSpeed.current.toFixed(1), centerX, centerY - 10)

      // Unidad
      ctx.font = '16px system-ui'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText('Mbps', centerX, centerY + 25)

      // Label de fase
      if (label) {
        ctx.font = 'bold 14px system-ui'
        ctx.fillStyle = colors.primary
        ctx.fillText(label, centerX, centerY + 55)
      }

      animationFrame.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [speed, maxSpeed, phase, label])

  return (
    <div className="relative flex items-center justify-center">
      <canvas ref={canvasRef} className="drop-shadow-2xl" />

      {/* Indicador de fase */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {(['ping', 'download', 'upload'] as const).map((p) => (
          <div
            key={p}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              phase === p
                ? 'scale-150 ' +
                  (p === 'ping' ? 'bg-yellow-500' : p === 'download' ? 'bg-blue-500' : 'bg-green-500')
                : phase === 'complete' || 
                  (p === 'ping' && (phase === 'download' || phase === 'upload')) ||
                  (p === 'download' && phase === 'upload')
                ? 'bg-gray-500'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
