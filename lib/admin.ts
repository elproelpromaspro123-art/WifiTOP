import { NextRequest } from 'next/server'

// IP admin autorizada
const ADMIN_IPS = process.env.ADMIN_IPS?.split(',').map(ip => ip.trim()) || ['201.221.178.117']

/**
 * Obtiene la IP real del cliente
 */
export function getRealIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

/**
 * Verifica si la IP es admin
 */
export function isAdminIP(ip: string): boolean {
  return ADMIN_IPS.includes(ip)
}
