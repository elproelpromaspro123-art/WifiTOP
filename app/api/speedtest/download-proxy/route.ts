/**
 * Download proxy endpoint - simulates large files without actually transferring them
 * Streams infinite data to measure real bandwidth without CORS limitations
 */

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bytes = parseInt(searchParams.get('bytes') || '10000000', 10)
  const duration = parseInt(searchParams.get('duration') || '30000', 10) // 30s

  // Generate stream that sends data for the specified duration
  const encoder = new TextEncoder()
  const chunkSize = 65536 // 64KB chunks
  const chunkData = new Uint8Array(chunkSize).fill(65) // 'A' character repeated
  
  let sent = 0
  const startTime = Date.now()
  
  const readable = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        
        // Stop after duration OR after requested bytes
        if (elapsed > duration || sent >= bytes) {
          clearInterval(interval)
          controller.close()
          return
        }
        
        // Send chunk
        controller.enqueue(chunkData)
        sent += chunkSize
      }, 10) // Send every 10ms for smooth stream
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
