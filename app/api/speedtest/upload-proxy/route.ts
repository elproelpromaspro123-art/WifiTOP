/**
 * Upload proxy endpoint - receives data and discards it
 * Returns 204 No Content for speed (no JSON parsing overhead)
 */

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max duration

export async function POST(request: Request) {
  try {
    // Consume the body fully and discard - just count bytes
    const reader = request.body?.getReader()
    let bytesReceived = 0
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytesReceived += value?.length || 0
      }
      reader.releaseLock()
    } else {
      // Fallback: read as arrayBuffer
      const buffer = await request.arrayBuffer()
      bytesReceived = buffer.byteLength
    }

    // Return 204 No Content for minimal overhead
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Upload proxy error:', error)
    return new Response(null, { 
      status: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Content-Length',
      'Access-Control-Max-Age': '86400',
    },
  })
}
