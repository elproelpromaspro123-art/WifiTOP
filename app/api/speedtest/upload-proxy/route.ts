/**
 * Upload proxy endpoint - accepts data for measuring upload speed
 * Simulates receiving data without storing it (sink mode)
 * Eliminates CORS issues by running on same domain
 */

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max duration

export async function POST(request: Request) {
  try {
    const startTime = Date.now()
    let bytesReceived = 0
    
    // Read the request body as stream
    if (!request.body) {
      return new Response(
        JSON.stringify({ error: 'No body provided', received: 0 }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Process stream in chunks
    const reader = request.body.getReader()
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytesReceived += value?.length || 0
      }
    } finally {
      reader.releaseLock()
    }

    const elapsedMs = Date.now() - startTime
    const speedMbps = (bytesReceived * 8) / (elapsedMs / 1000) / 1_000_000

    return new Response(
      JSON.stringify({
        success: true,
        received: bytesReceived,
        duration: elapsedMs,
        speed: speedMbps
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Upload proxy error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        received: 0
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Content-Length',
      'Access-Control-Max-Age': '86400',
    },
  })
}
