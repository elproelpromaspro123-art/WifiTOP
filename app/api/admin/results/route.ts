import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getRealIP, isAdminIP } from '@/lib/admin'

/**
 * GET: Obtener todos los resultados (solo admin)
 */
export async function GET(request: NextRequest) {
  const ip = getRealIP(request)

  if (!isAdminIP(ip)) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    )
  }

  try {
    const result = await query(
      `
      SELECT 
        id,
        user_name as "userName",
        download_speed as "downloadSpeed",
        upload_speed as "uploadSpeed",
        ping,
        city,
        country,
        isp,
        created_at as "createdAt"
      FROM results
      ORDER BY download_speed DESC
      `
    )

    return NextResponse.json(
      {
        success: true,
        total: result.rows.length,
        results: result.rows,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Error al obtener resultados' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Eliminar un resultado específico (solo admin)
 */
export async function DELETE(request: NextRequest) {
  const ip = getRealIP(request)

  if (!isAdminIP(ip)) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID de resultado requerido' },
        { status: 400 }
      )
    }

    const result = await query(
      `DELETE FROM results WHERE id = $1 RETURNING id`,
      [id]
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
