export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const reader = request.body?.getReader();
  if (reader) {
      try {
          while (true) {
              const { done } = await reader.read();
              if (done) break;
          }
      } catch (e) {
          // Ignore errors during read (client abort, etc)
      }
  }
  return new Response(null, { status: 200 });
}