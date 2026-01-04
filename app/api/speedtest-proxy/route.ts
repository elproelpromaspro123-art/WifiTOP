/**
 * API Proxy para el servidor speedtest en puerto 3001
 * Redirecciona las peticiones al servidor interno
 */

export async function GET(request: Request) {
  try {
    const speedtestUrl = process.env.SPEEDTEST_INTERNAL_URL || 'http://localhost:3001'
    const response = await fetch(`${speedtestUrl}/speedtest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return Response.json(
        { error: 'Speedtest server error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Speedtest proxy error:', error)
    return Response.json(
      { error: 'No se pudo conectar al servidor de speedtest' },
      { status: 503 }
    )
  }
}
