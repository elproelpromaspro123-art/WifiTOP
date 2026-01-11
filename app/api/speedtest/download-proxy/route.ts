/**
 * Download proxy endpoint - streams real data for specified duration
 * Transfers actual bytes to measure real bandwidth without CORS limitations
 */

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60 seconds

// Pre-generate a reusable chunk of pseudo-random data
function generateChunk(size: number): Uint8Array {
  const chunk = new Uint8Array(size)
  // Use a simple PRNG pattern that's fast to generate
  let seed = Date.now()
  for (let i = 0; i < size; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    chunk[i] = seed & 0xff
  }
  return chunk
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const duration = parseInt(searchParams.get('duration') || '30000', 10) // 30s by default

    // Generate chunk once at start (1MB for good throughput)
    const chunkSize = 1024 * 1024 // 1MB chunks
    const chunk = generateChunk(chunkSize)
    
    const startTime = Date.now()
    let closed = false

    const readable = new ReadableStream({
      pull(controller) {
        if (closed) return
        
        const elapsed = Date.now() - startTime
        
        // Stop after duration
        if (elapsed > duration) {
          closed = true
          controller.close()
          return
        }
        
        // Send the pre-generated chunk
        controller.enqueue(chunk)
      },
      cancel() {
        closed = true
      }
    })

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    })
  } catch (error) {
    console.error('Download proxy error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
