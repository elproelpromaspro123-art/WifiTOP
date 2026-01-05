export const runtime = 'nodejs'

export async function POST(request: Request) {
    const start = Date.now()

    try {
        const blob = await request.blob()
        const size = blob.size

        const response = await fetch('https://speed.cloudflare.com/__up', {
            method: 'POST',
            body: blob,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        })

        const duration = (Date.now() - start) / 1000

        if (!response.ok) {
            return Response.json({ error: 'Upload failed' }, { status: 400 })
        }

        const speedMbps = (size * 8) / duration / 1024 / 1024

        return Response.json({
            bytes: size,
            duration,
            speedMbps
        })
    } catch (error) {
        return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
