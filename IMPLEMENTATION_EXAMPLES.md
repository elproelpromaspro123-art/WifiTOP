# 💻 Ejemplos de Implementación

## 1️⃣ Deduplicar Tipos (5 min)

**Eliminar:**
```typescript
// ❌ BORRAR lib/speedtest.ts líneas 1-6
export interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  jitter: number
}
```

**Agregar importación:**
```typescript
// ✅ CAMBIAR en lib/speedtest.ts
import { SpeedTestResult } from '@/types'

// El resto del archivo igual
```

---

## 2️⃣ Optimizar maintainRanking() (10 min)

**Archivo:** `lib/ranking.ts`

**Reemplazar la función (líneas 114-155) con:**
```typescript
/**
 * Mantiene el ranking limitado a 1000 resultados usando una sola query
 */
export async function maintainRanking() {
  try {
    const minSpeedResult = await query<{ download_speed: number }>(
      `
      SELECT COALESCE(
        (SELECT download_speed 
         FROM results 
         ORDER BY download_speed DESC 
         LIMIT 1 OFFSET $1),
        0
      ) as download_speed
      `,
      [TOP_RESULTS_LIMIT - 1]
    )
    
    const minSpeed = minSpeedResult.rows[0]?.download_speed || 0

    // Eliminar en una sola query
    if (minSpeed > 0) {
      const deleteResult = await query(
        `
        WITH ranked_results AS (
          SELECT id,
                 ROW_NUMBER() OVER (ORDER BY download_speed DESC) as rn
          FROM results
        )
        DELETE FROM results
        WHERE id NOT IN (
          SELECT id FROM ranked_results WHERE rn <= $1
        )
        `,
        [TOP_RESULTS_LIMIT]
      )
      console.log('Ranking maintenance:', deleteResult.rowCount, 'rows deleted')
    }
  } catch (error) {
    console.error('Error maintaining ranking:', error)
    throw error
  }
}
```

**Beneficios:**
- ✅ Reduce de 3 queries a 1-2
- ✅ Más rápido en producción
- ✅ Menos carga en BD

---

## 3️⃣ Rate Limiting con BD (15 min)

**Archivo:** `lib/db.ts` - Agregar tabla al `initializeDatabase()`

```typescript
export async function initializeDatabase() {
  try {
    // ... tabla de results existente ...

    // ✨ AGREGAR ESTA TABLA:
    await query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        ip_address VARCHAR(255) PRIMARY KEY,
        request_count INTEGER DEFAULT 1,
        last_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hour_requests INTEGER DEFAULT 1,
        last_hour_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Índice para limpieza
    await query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_last_request
      ON rate_limits(last_request)
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}
```

**Archivo:** `lib/rate-limit.ts` (NUEVO ARCHIVO)

```typescript
import { query } from './db'

const MINUTE_LIMIT = 5
const HOUR_LIMIT = 20
const CLEANUP_INTERVAL = 600000 // 10 minutos

// Limpiar registros antiguos periódicamente
setInterval(async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    await query(
      `DELETE FROM rate_limits WHERE last_hour_reset < $1`,
      [oneHourAgo]
    )
  } catch (error) {
    console.error('Rate limit cleanup error:', error)
  }
}, CLEANUP_INTERVAL)

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const now = new Date().toISOString()
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()

    // Obtener o crear registro
    const result = await query(
      `
      INSERT INTO rate_limits (ip_address, request_count, last_request, hour_requests)
      VALUES ($1, 1, $2, 1)
      ON CONFLICT (ip_address) DO UPDATE SET
        request_count = CASE
          WHEN rate_limits.last_request > $3 THEN rate_limits.request_count + 1
          ELSE 1
        END,
        last_request = $2,
        hour_requests = CASE
          WHEN rate_limits.last_hour_reset > $4 THEN rate_limits.hour_requests + 1
          ELSE 1
        END,
        last_hour_reset = CASE
          WHEN rate_limits.last_hour_reset > $4 THEN rate_limits.last_hour_reset
          ELSE $2
        END
      RETURNING request_count, hour_requests
      `,
      [ip, now, oneMinuteAgo, new Date(Date.now() - 3600000).toISOString()]
    )

    const { request_count, hour_requests } = result.rows[0]

    // Verificar límites
    if (request_count > MINUTE_LIMIT) {
      return {
        allowed: false,
        retryAfter: 60, // Reintentar en 60 segundos
      }
    }

    if (hour_requests > HOUR_LIMIT) {
      return {
        allowed: false,
        retryAfter: 3600, // Reintentar en 1 hora
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Si hay error, permitir el request para no bloquear
    return { allowed: true }
  }
}
```

**Reemplazar en `app/api/speedtest/route.ts`:**
```typescript
import { checkRateLimit } from '@/lib/rate-limit' // ← NUEVO
// Eliminar las líneas 7-59 (toda la lógica antigua del rateLimitMap)

export async function POST(request: NextRequest) {
  const ip = getRealIP(request)
  const rateLimit = await checkRateLimit(ip) // ← Ahora es async con BD
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta más tarde.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter || 60),
        },
      }
    )
  }
  
  // ... resto del código igual
}
```

---

## 4️⃣ Componente de Validación Moderno (10 min)

**Archivo:** `components/ValidationError.tsx` (NUEVO)

```typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ValidationErrorProps {
  message: string | null
  type?: 'error' | 'warning' | 'success'
  autoClose?: number
  onClose?: () => void
}

export default function ValidationError({
  message,
  type = 'error',
  autoClose = 5000,
  onClose,
}: ValidationErrorProps) {
  const [isVisible, setIsVisible] = useState(!!message)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, autoClose)
        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [message, autoClose, onClose])

  const colors = {
    error: 'border-red-500/30 bg-red-500/10 text-red-200',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
    success: 'border-green-500/30 bg-green-500/10 text-green-200',
  }

  const icons = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
  }

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            rounded-lg p-3 mb-4 border flex items-center gap-3
            ${colors[type]}
          `}
        >
          <span className="text-lg">{icons[type]}</span>
          <span className="flex-1 text-sm">{message}</span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-lg hover:opacity-70 transition"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Usar en `components/SpeedTestCard.tsx`:**
```typescript
'use client'

import { useState } from 'react'
import ValidationError from './ValidationError' // ← NUEVO

export default function SpeedTestCard({ onTestComplete }: SpeedTestCardProps) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [userName, setUserName] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Listo')
  const [validationError, setValidationError] = useState<string | null>(null) // ← NUEVO

  const handleStartTest = async () => {
    setValidationError(null) // ← LIMPIAR

    if (!userName.trim()) {
      setValidationError('Por favor ingresa tu nombre') // ← EN VEZ DE alert()
      return
    }

    // ... resto del código igual, pero capturar errores:
    try {
      // ...
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      setValidationError(`Error: ${errorMsg}`)
      setTesting(false)
    }
  }

  return (
    <motion.div>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Prueba tu WiFi</h2>
        
        {/* ← AGREGAR AQUÍ */}
        <ValidationError
          message={validationError}
          onClose={() => setValidationError(null)}
        />

        {!result ? (
          <>
            <input
              type="text"
              placeholder="Tu nombre"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={testing}
              className="w-full px-4 py-3 rounded-lg mb-6 disabled:opacity-50"
            />
            {/* ... resto igual ... */}
          </>
        ) : (
          <>
            {/* mostrar resultados ... */}
          </>
        )}
      </div>
    </motion.div>
  )
}
```

---

## 5️⃣ Toast para Errores en Hooks (10 min)

**Archivo:** `hooks/useStats.ts`

```typescript
import { useState, useEffect } from 'react'
import { StatsData } from '@/types'

interface UseStatsReturn {
  stats: StatsData
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<StatsData>({ total: 0, maxSpeed: 0, avgSpeed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/stats')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al obtener estadísticas')
      }

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
        setError(null) // ← Limpiar error si éxito
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
```

**Usar en `app/page.tsx`:**
```typescript
export default function Home() {
  const [results, setResults] = useState<any>(null)
  const { stats, loading, error, refetch } = useStats() // ← error ahora disponible
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      setStatsError(error)
    }
  }, [error])

  return (
    <main className="min-h-screen bg-dark-bg overflow-hidden">
      {/* ... background elements ... */}
      <div className="relative z-10">
        <Header />

        {/* ← AGREGAR VALIDACIÓN ERROR */}
        {statsError && (
          <div className="container mx-auto px-4 mt-4">
            <ValidationError
              message={statsError}
              type="error"
              onClose={() => setStatsError(null)}
            />
          </div>
        )}

        {/* ... resto igual ... */}
      </div>
    </main>
  )
}
```

---

## Resumen de Cambios

| Mejora | Archivos | Líneas | Tiempo |
|--------|----------|--------|--------|
| Deduplicar tipos | `lib/speedtest.ts`, `types/index.ts` | ~6 | 5 min |
| Optimizar queries | `lib/ranking.ts` | 42→28 | 10 min |
| Rate limit BD | `lib/rate-limit.ts` (nuevo), `app/api/speedtest/route.ts` | +80 | 15 min |
| Validación UI | `components/ValidationError.tsx` (nuevo) | +65 | 10 min |
| Errores en hooks | `hooks/useStats.ts`, `hooks/useRanking.ts` | +20 | 10 min |

**Total: ~50 minutos de trabajo** = +200 líneas de código = Mejoras significativas en seguridad, performance y UX
