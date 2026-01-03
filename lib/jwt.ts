// JWT helper para admin authentication
// Nota: En un entorno real, deberías usar una librería como 'jsonwebtoken'
// Este es un helper simplificado para desarrollo

const JWT_SECRET = process.env.JWT_SECRET || 'wifitop-dev-secret-key-change-in-production'
const ADMIN_IP = process.env.ADMIN_IP_ADDRESS || '201.221.178.117'

interface JWTPayload {
  ip: string
  iat: number
  exp: number
}

/**
 * Valida si la IP es autorizada para admin
 */
export function isAuthorizedAdminIP(ip: string): boolean {
  // Permitir localhost en desarrollo
  if (process.env.NODE_ENV === 'development') {
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
      return true
    }
  }

  // Verificar contra ADMIN_IP_ADDRESS env var
  return ip === ADMIN_IP
}

/**
 * Genera un token simple para admin (válido 24 horas)
 */
export function generateAdminToken(ip: string): string {
  const now = Date.now()
  const payload: JWTPayload = {
    ip,
    iat: now,
    exp: now + 24 * 60 * 60 * 1000 // 24 horas
  }

  // Crear un token JSON simple (no es un JWT real, es solo un JSON encodificado)
  // En producción, usa la librería 'jsonwebtoken'
  const tokenData = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = Buffer.from(`${tokenData}:${JWT_SECRET}`).toString('base64')

  return `${tokenData}.${signature}`
}

/**
 * Valida un token de admin
 */
export function validateAdminToken(token: string): { valid: boolean; ip?: string } {
  try {
    const [tokenData, signature] = token.split('.')

    // Validar firma
    const expectedSignature = Buffer.from(`${tokenData}:${JWT_SECRET}`).toString('base64')
    if (signature !== expectedSignature) {
      return { valid: false }
    }

    // Decodificar payload
    const payload = JSON.parse(Buffer.from(tokenData, 'base64').toString()) as JWTPayload

    // Validar expiración
    if (payload.exp < Date.now()) {
      return { valid: false }
    }

    return { valid: true, ip: payload.ip }
  } catch (error) {
    return { valid: false }
  }
}

/**
 * Obtiene IP de request y valida
 */
export function getRealIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}
