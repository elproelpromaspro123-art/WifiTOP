export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bytes = parseInt(searchParams.get('bytes') || '0', 10);

  if (!bytes) {
      return new Response(null, { status: 200 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 64 * 1024; // 64KB
      const chunk = new Uint8Array(chunkSize); // Zero-filled is fast
      let sent = 0;

      while (sent < bytes) {
        const remaining = bytes - sent;
        const currentChunkSize = Math.min(chunkSize, remaining);
        
        if (currentChunkSize === chunkSize) {
            controller.enqueue(chunk);
        } else {
            controller.enqueue(chunk.slice(0, currentChunkSize));
        }
        sent += currentChunkSize;
        
        // Basic backpressure handling
        if (controller.desiredSize !== null && controller.desiredSize <= 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': bytes.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}