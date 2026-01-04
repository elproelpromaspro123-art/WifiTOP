'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface DataPoint {
    time: number
    value: number
}

interface SpeedChartLiveProps {
    data: DataPoint[]
    title: string
    unit: string
    color: string
    height?: number
}

export default function SpeedChartLive({
    data,
    title,
    unit,
    color,
    height = 150
}: SpeedChartLiveProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || data.length < 2) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Configurar resolución
        canvas.width = canvas.offsetWidth * 2
        canvas.height = height * 2
        ctx.scale(2, 2)

        // Limpiar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.fillRect(0, 0, canvas.width / 2, height)

        // Encontrar min/max
        const values = data.map(d => d.value)
        const minVal = Math.min(...values)
        const maxVal = Math.max(...values)
        const range = maxVal - minVal || 1

        // Dibujar línea
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()

        data.forEach((point, i) => {
            const x = (i / (data.length - 1)) * (canvas.width / 2)
            const y = height - ((point.value - minVal) / range) * (height * 0.8) - 10

            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        })

        ctx.stroke()

        // Dibujar puntos
        ctx.fillStyle = color
        data.forEach((point, i) => {
            const x = (i / (data.length - 1)) * (canvas.width / 2)
            const y = height - ((point.value - minVal) / range) * (height * 0.8) - 10

            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fill()
        })

        // Texto de valores
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`Max: ${maxVal.toFixed(1)} ${unit}`, canvas.width / 2 - 5, 15)
        ctx.fillText(`Min: ${minVal.toFixed(1)} ${unit}`, canvas.width / 2 - 5, 28)
    }, [data, color, unit, height])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-2 border border-white/10"
        >
            <p className="text-xs font-semibold text-gray-400 mb-1">{title}</p>
            <canvas
                ref={canvasRef}
                className="w-full"
                style={{ height: `${height}px` }}
            />
        </motion.div>
    )
}
