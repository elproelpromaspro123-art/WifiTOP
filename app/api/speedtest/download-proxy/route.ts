/**
 * Download proxy endpoint - streams data for specified duration using push-based approach
 * This ensures the stream always closes properly regardless of client behavior
 */

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60 seconds

// Pre-generate a reusable chunk of pseudo-random data
function generateChunk(size: number): Uint8Array {
  const chunk = new Uint8Array(size)
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
    const duration = Math.min(
      parseInt(searchParams.get('duration') || '30000', 10),
      maxDuration * 1000
    )

    // Generate 1MB chunk for streaming
    const chunkSize = 1024 * 1024 // 1MB
    const chunk = generateChunk(chunkSize)
    const startTime = Date.now()
    let closed = false

    const readable = new ReadableStream({
      start(controller) {
        // Push-based approach: actively push data on a timer
        function push() {
          if (closed) return
          
          const elapsed = Date.now() - startTime
          if (elapsed >= duration) {
            closed = true
            controller.close()
            return
          }
          
          try {
            controller.enqueue(chunk)
            // Use setImmediate pattern for Node.js or setTimeout(0) for browser
            setTimeout(push, 0)
          } catch {
            // Controller might be closed
            closed = true
          }
        }
        push()
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
        'X-Accel-Buffering': 'no',
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
