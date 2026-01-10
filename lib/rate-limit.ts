import { query } from './db'

const MINUTE_LIMIT = 5
const HOUR_LIMIT = 20

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const now = new Date().toISOString()
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

    const result = await query(
      `
      INSERT INTO rate_limits (ip_address, request_count, last_request, hour_requests, last_hour_reset)
      VALUES ($1, 1, $2, 1, $2)
      ON CONFLICT (ip_address) DO UPDATE SET
        request_count = CASE WHEN rate_limits.last_request > $3 THEN rate_limits.request_count + 1 ELSE 1 END,
        last_request = $2,
        hour_requests = CASE WHEN rate_limits.last_hour_reset > $4 THEN rate_limits.hour_requests + 1 ELSE 1 END,
        last_hour_reset = CASE WHEN rate_limits.last_hour_reset > $4 THEN rate_limits.last_hour_reset ELSE $2 END
      RETURNING request_count, hour_requests
      `,
      [ip, now, oneMinuteAgo, oneHourAgo]
    )

    const { request_count, hour_requests } = result.rows[0] || {}
    if (request_count > MINUTE_LIMIT) return { allowed: false, retryAfter: 60 }
    if (hour_requests > HOUR_LIMIT) return { allowed: false, retryAfter: 3600 }
    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}
