export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const blob = await request.blob()

    if (blob.size < 100_000 || blob.size > 60_000_000) {
      return Response.json({ error: 'Invalid size' }, { status: 400 })
    }

    const start = performance.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000)

    const response = await fetch('https://speed.cloudflare.com/__up', {
      method: 'POST',
      body: blob,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/octet-stream' },
    })

    const duration = (performance.now() - start) / 1000
    clearTimeout(timeout)

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const speedMbps = (blob.size * 8) / duration / 1024 / 1024

    return Response.json({ bytes: blob.size, duration, speedMbps })
  } catch (error) {
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
