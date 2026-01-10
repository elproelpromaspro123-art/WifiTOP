/**
 * Download proxy endpoint - streams real data for specified duration
 * Transfers actual bytes to measure real bandwidth without CORS limitations
 */

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const duration = parseInt(searchParams.get('duration') || '30000', 10) // 30s by default

  // Generate continuous stream of random data for the specified duration
  const chunkSize = 1024 * 1024 // 1MB chunks for efficient streaming
  const startTime = Date.now()
  let sent = 0
  
  const readable = new ReadableStream({
    start(controller) {
      const sendChunk = () => {
        const elapsed = Date.now() - startTime
        
        // Stop after duration
        if (elapsed > duration) {
          controller.close()
          return
        }
        
        // Generate and send random data chunk
        const chunk = new Uint8Array(chunkSize)
        crypto.getRandomValues(chunk)
        controller.enqueue(chunk)
        sent += chunkSize
        
        // Schedule next chunk immediately for maximum throughput
        setImmediate(() => sendChunk())
      }
      
      sendChunk()
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="speedtest-data"',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-store, no-cache',
      'Transfer-Encoding': 'chunked',
    },
  })
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
