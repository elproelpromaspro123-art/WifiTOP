'use client'

import { useEffect, useRef } from 'react'

interface Props {
  samples: number[]
  phase: 'download' | 'upload'
  maxValue?: number
}

export default function SpeedChart({ samples, phase, maxValue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Limpiar
    ctx.clearRect(0, 0, width, height)

    if (samples.length < 2) return

    // Calcular máximo para escala
    const max = maxValue || Math.max(...samples) * 1.2
    const padding = { top: 10, right: 10, bottom: 20, left: 40 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Colores
    const colors = phase === 'download'
      ? { line: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)', glow: 'rgba(59, 130, 246, 0.5)' }
      : { line: '#10b981', fill: 'rgba(16, 185, 129, 0.2)', glow: 'rgba(16, 185, 129, 0.5)' }

    // Líneas de referencia horizontales
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1
    ctx.font = '10px system-ui'
    ctx.fillStyle = '#6b7280'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    const gridLines = 4
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i
      const value = max - (max / gridLines) * i

      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      ctx.fillText(value.toFixed(0), padding.left - 5, y)
    }

    // Dibujar área bajo la curva
    const getPoint = (index: number, value: number) => ({
      x: padding.left + (index / (samples.length - 1)) * chartWidth,
      y: padding.top + chartHeight - (value / max) * chartHeight,
    })

    // Área con gradiente
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, colors.fill)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.beginPath()
    ctx.moveTo(padding.left, height - padding.bottom)

    samples.forEach((value, index) => {
      const point = getPoint(index, value)
      if (index === 0) {
        ctx.lineTo(point.x, point.y)
      } else {
        // Curva suave usando bezier
        const prev = getPoint(index - 1, samples[index - 1])
        const cpx = (prev.x + point.x) / 2
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + point.y) / 2)
        if (index === samples.length - 1) {
          ctx.lineTo(point.x, point.y)
        }
      }
    })

    ctx.lineTo(width - padding.right, height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Línea principal con glow
    ctx.shadowColor = colors.glow
    ctx.shadowBlur = 10
    ctx.beginPath()

    samples.forEach((value, index) => {
      const point = getPoint(index, value)
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        const prev = getPoint(index - 1, samples[index - 1])
        const cpx = (prev.x + point.x) / 2
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + point.y) / 2)
        if (index === samples.length - 1) {
          ctx.lineTo(point.x, point.y)
        }
      }
    })

    ctx.strokeStyle = colors.line
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    ctx.shadowBlur = 0

    // Punto actual (último valor)
    if (samples.length > 0) {
      const lastPoint = getPoint(samples.length - 1, samples[samples.length - 1])

      // Círculo exterior con glow
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = colors.line
      ctx.shadowColor = colors.line
      ctx.shadowBlur = 15
      ctx.fill()
      ctx.shadowBlur = 0

      // Círculo interior blanco
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }

    // Etiqueta de unidad
    ctx.font = '10px system-ui'
    ctx.fillStyle = '#6b7280'
    ctx.textAlign = 'left'
    ctx.fillText('Mbps', padding.left, height - 5)

  }, [samples, phase, maxValue])

  return (
    <div className="w-full h-32 bg-gray-900/50 rounded-lg overflow-hidden border border-white/5">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
