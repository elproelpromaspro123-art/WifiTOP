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
  const glowIntensity = useRef(0)

  const phaseColors = {
    idle: { primary: '#4b5563', secondary: '#374151', glow: '#6b7280' },
    ping: { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fcd34d' },
    download: { primary: '#3b82f6', secondary: '#2563eb', glow: '#60a5fa' },
    upload: { primary: '#10b981', secondary: '#059669', glow: '#34d399' },
    complete: { primary: '#a855f7', secondary: '#9333ea', glow: '#c084fc' },
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 300
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 30

    const speedToAngle = (spd: number): number => {
      const maxAngle = 270
      const minAngle = -135
      if (spd <= 0) return minAngle

      const logSpeed = Math.log10(spd + 1)
      const logMax = Math.log10(maxSpeed + 1)
      const ratio = Math.min(1, logSpeed / logMax)

      return minAngle + ratio * maxAngle
    }

    let time = 0
    const draw = () => {
      time += 0.02
      ctx.clearRect(0, 0, size, size)

      const targetSpeed = speed
      const diff = targetSpeed - animatedSpeed.current
      animatedSpeed.current += diff * 0.12

      const targetGlow = phase !== 'idle' ? 1 : 0
      glowIntensity.current += (targetGlow - glowIntensity.current) * 0.1

      const colors = phaseColors[phase]
      const currentAngle = speedToAngle(animatedSpeed.current)

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2)
      const outerGradient = ctx.createRadialGradient(centerX, centerY, radius - 20, centerX, centerY, radius + 20)
      outerGradient.addColorStop(0, 'rgba(0,0,0,0)')
      outerGradient.addColorStop(0.5, `${colors.glow}${Math.floor(glowIntensity.current * 15).toString(16).padStart(2, '0')}`)
      outerGradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = outerGradient
      ctx.fill()

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, (Math.PI * 3) / 4, Math.PI / 4, false)
      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = 16
      ctx.lineCap = 'round'
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, (Math.PI * 3) / 4, Math.PI / 4, false)
      ctx.strokeStyle = '#0f0f1a'
      ctx.lineWidth = 12
      ctx.stroke()

      if (animatedSpeed.current > 0.1) {
        const gradient = ctx.createConicGradient((Math.PI * 3) / 4, centerX, centerY)
        gradient.addColorStop(0, colors.secondary)
        gradient.addColorStop(0.5, colors.primary)
        gradient.addColorStop(1, colors.glow)

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
        ctx.lineWidth = 12
        ctx.lineCap = 'round'
        ctx.stroke()

        ctx.save()
        ctx.shadowColor = colors.glow
        ctx.shadowBlur = 25 + Math.sin(time * 3) * 5
        ctx.beginPath()
        ctx.arc(
          centerX,
          centerY,
          radius,
          ((currentAngle + 135) * Math.PI) / 180 + (Math.PI * 3) / 4 - 0.1,
          ((currentAngle + 135) * Math.PI) / 180 + (Math.PI * 3) / 4,
          false
        )
        ctx.strokeStyle = colors.glow
        ctx.lineWidth = 12
        ctx.stroke()
        ctx.restore()
      }

      const scales = [0, 10, 50, 100, 250, 500, 1000]
      scales.forEach((val) => {
        if (val > maxSpeed) return
        const angle = ((speedToAngle(val) - 90) * Math.PI) / 180

        const innerRadius = radius - 22
        const outerRadius = radius - 14
        const x1 = centerX + Math.cos(angle) * innerRadius
        const y1 = centerY + Math.sin(angle) * innerRadius
        const x2 = centerX + Math.cos(angle) * outerRadius
        const y2 = centerY + Math.sin(angle) * outerRadius

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = val <= animatedSpeed.current ? colors.primary : '#3f3f5a'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()
      })

      ctx.save()
      ctx.font = 'bold 56px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      if (phase !== 'idle') {
        ctx.shadowColor = colors.glow
        ctx.shadowBlur = 20
      }
      
      const speedGradient = ctx.createLinearGradient(centerX - 50, centerY, centerX + 50, centerY)
      speedGradient.addColorStop(0, '#ffffff')
      speedGradient.addColorStop(1, '#e0e0e0')
      ctx.fillStyle = speedGradient
      ctx.fillText(animatedSpeed.current.toFixed(1), centerX, centerY - 10)
      ctx.restore()

      ctx.font = '600 15px system-ui'
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.fillText('Mbps', centerX, centerY + 25)

      if (label) {
        ctx.save()
        ctx.font = 'bold 13px system-ui'
        ctx.fillStyle = colors.primary
        ctx.shadowColor = colors.glow
        ctx.shadowBlur = 10
        ctx.textAlign = 'center'
        
        const labelY = centerY + 55
        const padding = 12
        const labelWidth = ctx.measureText(label).width + padding * 2
        
        ctx.beginPath()
        ctx.roundRect(centerX - labelWidth / 2, labelY - 10, labelWidth, 20, 6)
        ctx.fillStyle = `${colors.primary}20`
        ctx.fill()
        
        ctx.fillStyle = colors.primary
        ctx.fillText(label, centerX, labelY + 3)
        ctx.restore()
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
      <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
        phase !== 'idle' ? 'opacity-100' : 'opacity-0'
      }`} style={{
        background: `radial-gradient(circle, ${phaseColors[phase].glow}10 0%, transparent 70%)`
      }} />
      
      <canvas ref={canvasRef} className="relative z-10" />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
        {(['ping', 'download', 'upload'] as const).map((p) => {
          const isActive = phase === p
          const isCompleted = phase === 'complete' || 
            (p === 'ping' && (phase === 'download' || phase === 'upload')) ||
            (p === 'download' && phase === 'upload')
          
          const dotColor = p === 'ping' ? 'bg-yellow-500' : p === 'download' ? 'bg-blue-500' : 'bg-green-500'
          const shadowColor = p === 'ping' ? 'shadow-yellow-500/50' : p === 'download' ? 'shadow-blue-500/50' : 'shadow-green-500/50'
          
          return (
            <div
              key={p}
              className={`relative transition-all duration-500 ${
                isActive ? 'scale-125' : ''
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? `${dotColor} shadow-lg ${shadowColor} animate-pulse`
                    : isCompleted
                    ? dotColor
                    : 'bg-gray-700'
                }`}
              />
              {isActive && (
                <div className={`absolute inset-0 ${dotColor} rounded-full animate-ping opacity-75`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
