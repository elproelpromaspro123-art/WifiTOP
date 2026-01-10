export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bytes = parseInt(searchParams.get('bytes') || '10000000')

  if (bytes < 1_000_000 || bytes > 100_000_000) {
    return Response.json({ error: 'Invalid size' }, { status: 400 })
  }

  try {
    const start = performance.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}`, {
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!response.ok) {
      clearTimeout(timeout)
      throw new Error(`HTTP ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const duration = (performance.now() - start) / 1000
    clearTimeout(timeout)

    const speedMbps = (buffer.byteLength * 8) / duration / 1024 / 1024

    return Response.json({ bytes: buffer.byteLength, duration, speedMbps })
  } catch (error) {
    return Response.json({ error: 'Download failed' }, { status: 500 })
  }
}
