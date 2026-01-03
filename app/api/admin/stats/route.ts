import { query } from '@/lib/db'
import { headers } from 'next/headers'
import { isAuthorizedAdminIP } from '@/lib/jwt'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Obtener IP del cliente
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : headersList.get('x-real-ip') || 'unknown'

    // Validar IP autorizada
    if (!isAuthorizedAdminIP(clientIp)) {
      return Response.json(
        { error: 'Acceso denegado. IP no autorizada.' },
        { status: 403 }
      )
    }

    // Obtener estadísticas generales
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_tests,
        AVG(download_speed) as avg_download,
        AVG(upload_speed) as avg_upload,
        AVG(ping) as avg_ping,
        MAX(download_speed) as max_download,
        MAX(upload_speed) as max_upload,
        MIN(ping) as min_ping
      FROM results
    `)

    const stats = statsResult.rows[0] || {
      total_tests: 0,
      avg_download: 0,
      avg_upload: 0,
      avg_ping: 0,
      max_download: 0,
      max_upload: 0,
      min_ping: 0
    }

    // Top usuarios
    const topUsersResult = await query(`
      SELECT 
        user_name,
        download_speed,
        upload_speed,
        ping,
        created_at
      FROM results
      ORDER BY download_speed DESC
      LIMIT 10
    `)

    // Estadísticas por país
    const countryStatsResult = await query(`
      SELECT 
        country,
        COUNT(*) as test_count,
        AVG(download_speed) as avg_speed,
        MAX(download_speed) as max_speed
      FROM results
      WHERE country IS NOT NULL
      GROUP BY country
      ORDER BY test_count DESC
      LIMIT 20
    `)

    // Tests en últimas 24 horas
    const recentTestsResult = await query(`
      SELECT 
        COUNT(*) as last_24h
      FROM results
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `)

    // Estadísticas de estabilidad (si existen)
    const stabilityResult = await query(`
      SELECT 
        COUNT(CASE WHEN download_speed > 0 THEN 1 END) as successful_tests,
        COUNT(*) as total_attempts
      FROM results
    `)

    return Response.json({
      success: true,
      stats: {
        totalTests: parseInt(stats.total_tests || 0),
        avgDownload: parseFloat(stats.avg_download || 0).toFixed(2),
        avgUpload: parseFloat(stats.avg_upload || 0).toFixed(2),
        avgPing: parseFloat(stats.avg_ping || 0).toFixed(2),
        maxDownload: parseFloat(stats.max_download || 0).toFixed(2),
        maxUpload: parseFloat(stats.max_upload || 0).toFixed(2),
        minPing: parseFloat(stats.min_ping || 0).toFixed(2),
      },
      topUsers: topUsersResult.rows.map((row: any) => ({
        name: row.user_name,
        download: parseFloat(row.download_speed).toFixed(2),
        upload: parseFloat(row.upload_speed).toFixed(2),
        ping: parseFloat(row.ping).toFixed(1),
        date: row.created_at
      })),
      countryStats: countryStatsResult.rows.map((row: any) => ({
        country: row.country,
        tests: row.test_count,
        avgSpeed: parseFloat(row.avg_speed).toFixed(2),
        maxSpeed: parseFloat(row.max_speed).toFixed(2)
      })),
      last24h: parseInt(recentTestsResult.rows[0]?.last_24h || 0),
      successRate: stabilityResult.rows.length > 0
        ? (
            (parseInt(stabilityResult.rows[0]?.successful_tests || 0) /
              parseInt(stabilityResult.rows[0]?.total_attempts || 1)) * 100
          ).toFixed(2)
        : '0.00'
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return Response.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
