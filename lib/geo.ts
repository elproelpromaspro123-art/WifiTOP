export async function getGeoLocation(ip: string) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      if (!data.error) {
        return { country: data.country_name || 'Desconocido', isp: data.org || 'Desconocido' }
      }
    }
  } catch {}

  try {
    const res = await fetch(`https://ip-api.com/json/${ip}?fields=country,org`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.status === 'success') {
        return { country: data.country || 'Desconocido', isp: data.org || 'Desconocido' }
      }
    }
  } catch {}

  return { country: 'Desconocido', isp: 'Desconocido' }
}
