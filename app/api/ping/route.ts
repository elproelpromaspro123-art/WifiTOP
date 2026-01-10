export const runtime = 'nodejs'

async function measureLatency(): Promise<number> {
  const urls = ['https://1.1.1.1/', 'https://speed.cloudflare.com/api/timing']
  const samples: number[] = []

  for (const url of urls) {
    for (let i = 0; i < 2; i++) {
      const start = performance.now()
      try {
        await fetch(url, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(3000) })
        const latency = performance.now() - start
        if (latency > 0.1 && latency < 5000) samples.push(latency)
        if (samples.length >= 4) break
      } catch {}
    }
    if (samples.length >= 4) break
  }

  if (samples.length === 0) throw new Error('No se pudo medir latencia')
  return Math.min(...samples)
}

export async function GET() {
  try {
    const latency = await measureLatency()
    return Response.json({ success: true, latency: Math.round(latency * 10) / 10 })
  } catch (error) {
    return Response.json({ success: false, error: 'Error midiendo latencia' }, { status: 500 })
  }
}
