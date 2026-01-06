import { query } from './db'

const MINUTE_LIMIT = 5
const HOUR_LIMIT = 20
const CLEANUP_INTERVAL = 600000 // 10 minutos

// Ejecutar limpieza cada 10 minutos
if (typeof global !== 'undefined') {
  const interval = setInterval(async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
      await query(
        `DELETE FROM rate_limits WHERE last_hour_reset < $1`,
        [oneHourAgo]
      )
    } catch (error) {
      // Silently handle cleanup errors
    }
  }, CLEANUP_INTERVAL)

  // Evitar memory leak en desarrollo
  if (process.env.NODE_ENV === 'development') {
    interval.unref?.()
  }
}

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const now = new Date().toISOString()
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

    // Obtener o crear registro con lógica de actualización inteligente
    const result = await query(
      `
      INSERT INTO rate_limits (ip_address, request_count, last_request, hour_requests, last_hour_reset)
      VALUES ($1, 1, $2, 1, $2)
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
      [ip, now, oneMinuteAgo, oneHourAgo]
    )

    const row = result.rows[0]
    if (!row) {
      return { allowed: false, retryAfter: 60 }
    }

    const { request_count, hour_requests } = row

    // Verificar límite por minuto
    if (request_count > MINUTE_LIMIT) {
      return {
        allowed: false,
        retryAfter: 60,
      }
    }

    // Verificar límite por hora
    if (hour_requests > HOUR_LIMIT) {
      return {
        allowed: false,
        retryAfter: 3600,
      }
    }

    return { allowed: true }
  } catch (error) {
    return { allowed: true }
  }
}
