import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getRealIP, isAdminIP } from '@/lib/admin'

/**
 * DELETE: Eliminar resultado por ID (solo admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getRealIP(request)

  if (!isAdminIP(ip)) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    )
  }

  try {
    const { id } = params

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const result = await query(
      `DELETE FROM results WHERE id = $1 RETURNING id`,
      [Number(id)]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Resultado no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Resultado ${id} eliminado correctamente`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting result:', error)
    return NextResponse.json(
      { error: 'Error al eliminar resultado' },
      { status: 500 }
    )
  }
}
