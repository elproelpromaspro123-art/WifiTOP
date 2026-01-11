'use client'

import { useEffect, useRef } from 'react'

interface Props {
  samples: number[]
  phase: 'download' | 'upload'
  maxValue?: number
}

export default function SpeedChart({ samples, phase, maxValue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrame = useRef<number>()
  const animatedSamples = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    if (samples.length < 2) return

    while (animatedSamples.current.length < samples.length) {
      animatedSamples.current.push(0)
    }

    const colors = phase === 'download'
      ? { 
          line: '#3b82f6', 
          lineEnd: '#60a5fa',
          fill: 'rgba(59, 130, 246, 0.15)', 
          fillEnd: 'rgba(59, 130, 246, 0.02)',
          glow: 'rgba(59, 130, 246, 0.6)',
          dot: '#93c5fd'
        }
      : { 
          line: '#10b981', 
          lineEnd: '#34d399',
          fill: 'rgba(16, 185, 129, 0.15)', 
          fillEnd: 'rgba(16, 185, 129, 0.02)',
          glow: 'rgba(16, 185, 129, 0.6)',
          dot: '#6ee7b7'
        }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < samples.length; i++) {
        const diff = samples[i] - animatedSamples.current[i]
        animatedSamples.current[i] += diff * 0.15
      }

      const max = maxValue || Math.max(...samples) * 1.2
      const padding = { top: 15, right: 15, bottom: 25, left: 45 }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom

      ctx.strokeStyle = '#1f2937'
      ctx.lineWidth = 1
      ctx.font = '11px system-ui'
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'

      const gridLines = 4
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i
        const value = max - (max / gridLines) * i

        ctx.beginPath()
        ctx.setLineDash([4, 4])
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillText(value.toFixed(0), padding.left - 8, y)
      }

      const getPoint = (index: number, value: number) => ({
        x: padding.left + (index / (animatedSamples.current.length - 1)) * chartWidth,
        y: padding.top + chartHeight - (value / max) * chartHeight,
      })

      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
      gradient.addColorStop(0, colors.fill)
      gradient.addColorStop(0.7, colors.fillEnd)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.beginPath()
      ctx.moveTo(padding.left, height - padding.bottom)

      animatedSamples.current.forEach((value, index) => {
        const point = getPoint(index, value)
        if (index === 0) {
          ctx.lineTo(point.x, point.y)
        } else {
          const prev = getPoint(index - 1, animatedSamples.current[index - 1])
          const tension = 0.3
          const cp1x = prev.x + (point.x - prev.x) * tension
          const cp2x = point.x - (point.x - prev.x) * tension
          ctx.bezierCurveTo(cp1x, prev.y, cp2x, point.y, point.x, point.y)
        }
      })

      ctx.lineTo(width - padding.right, height - padding.bottom)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.save()
      ctx.shadowColor = colors.glow
      ctx.shadowBlur = 12

      const lineGradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0)
      lineGradient.addColorStop(0, colors.line)
      lineGradient.addColorStop(1, colors.lineEnd)

      ctx.beginPath()
      animatedSamples.current.forEach((value, index) => {
        const point = getPoint(index, value)
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          const prev = getPoint(index - 1, animatedSamples.current[index - 1])
          const tension = 0.3
          const cp1x = prev.x + (point.x - prev.x) * tension
          const cp2x = point.x - (point.x - prev.x) * tension
          ctx.bezierCurveTo(cp1x, prev.y, cp2x, point.y, point.x, point.y)
        }
      })

      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.restore()

      if (animatedSamples.current.length > 0) {
        const lastPoint = getPoint(animatedSamples.current.length - 1, animatedSamples.current[animatedSamples.current.length - 1])

        ctx.save()
        ctx.shadowColor = colors.line
        ctx.shadowBlur = 20
        ctx.beginPath()
        ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = colors.line
        ctx.fill()
        ctx.restore()

        ctx.beginPath()
        ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = colors.dot
        ctx.fill()

        ctx.beginPath()
        ctx.arc(lastPoint.x, lastPoint.y, 12, 0, Math.PI * 2)
        ctx.strokeStyle = `${colors.line}40`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.font = 'bold 10px system-ui'
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'left'
      ctx.fillText('Mbps', padding.left, height - 6)

      animationFrame.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [samples, phase, maxValue])

  return (
    <div className="relative w-full h-36 bg-gradient-to-br from-gray-900/80 to-black/60 rounded-xl overflow-hidden border border-white/10 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.02]" />
      <canvas ref={canvasRef} className="w-full h-full relative z-10" />
    </div>
  )
}
