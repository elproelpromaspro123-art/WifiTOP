// Este endpoint no debe pre-renderizarse
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Este endpoint está deprecado. Usa el cliente directamente en /test',
    },
    { status: 410 }
  )
}
