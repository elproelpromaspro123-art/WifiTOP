export const runtime = 'nodejs'

async function measureLatency(): Promise<number> {
    const samples: number[] = []
    
    for (let i = 0; i < 3; i++) {
        const start = performance.now()
        try {
            await fetch('https://1.1.1.1/', {
                method: 'HEAD',
                cache: 'no-store',
                signal: AbortSignal.timeout(2000)
            }).catch(() => { })
            
            const latency = performance.now() - start
            if (latency > 0 && latency < 500) {
                samples.push(latency)
            }
        } catch (e) {
            // Continue
        }
    }
    
    if (samples.length === 0) {
        const start = performance.now()
        try {
            const response = await fetch('https://speed.cloudflare.com/api/timing', {
                method: 'GET',
                cache: 'no-store',
                signal: AbortSignal.timeout(2000)
            })
            
            const latency = performance.now() - start
            return latency > 0 ? latency : 10
        } catch (e) {
            return 15
        }
    }
    
    return Math.min(...samples)
}

export async function GET() {
    const latency = await measureLatency()
    return Response.json({ latency: Math.round(latency * 10) / 10 })
}
