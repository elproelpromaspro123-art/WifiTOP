/**
 * Geolocalización por IP - Función auxiliar sin dependencias
 * Usa ipapi.co (gratis, sin clave API requerida)
 */

export async function getGeoLocation(ip: string) {
    try {
        // Usar múltiples fuentes en fallback
        
        // Intento 1: ipapi.co (sin auth, rápido)
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`, {
                next: { revalidate: 86400 }, // Cache 24h
                signal: AbortSignal.timeout(5000)
            })

            if (response.ok) {
                const data = await response.json()
                if (!data.error) {
                    return {
                        country: data.country_name || 'Desconocida',
                        isp: data.org || 'Desconocido',
                    }
                }
            }
        } catch {
            // Continuar con siguiente intento
        }

        // Intento 2: ip-api.com (con fallback)
        try {
            const response = await fetch(`https://ip-api.com/json/${ip}?fields=country,org`, {
                next: { revalidate: 86400 },
                signal: AbortSignal.timeout(5000)
            })

            if (response.ok) {
                const data = await response.json()
                if (data.status === 'success') {
                    return {
                        country: data.country || 'Desconocida',
                        isp: data.org || 'Desconocido',
                    }
                }
            }
        } catch {
            // Continuar con siguiente intento
        }

        // Si todo falla, retornar valores por defecto
        console.warn(`Geo lookup failed for IP: ${ip}`)
        return {
            country: 'Desconocida',
            isp: 'Desconocido',
        }
    } catch (error) {
        console.error('Error in geolocation:', error)
        return {
            country: 'Desconocida',
            isp: 'Desconocido',
        }
    }
}
