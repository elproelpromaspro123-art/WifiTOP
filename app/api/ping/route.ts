export const runtime = 'nodejs'

export async function GET() {
    const start = Date.now()
    
    try {
        const response = await fetch('https://speed.cloudflare.com/api/timing', {
            method: 'GET',
            cache: 'no-store'
        })
        
        const latency = Date.now() - start
        
        if (!response.ok) {
            return Response.json({ latency: latency > 0 ? latency : 10 })
        }
        
        return Response.json({ latency })
    } catch (error) {
        return Response.json({ latency: 20 })
    }
}
