import { query } from '@/lib/db'
import { headers } from 'next/headers'
import { isAuthorizedAdminIP } from '@/lib/jwt'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : headersList.get('x-real-ip') || 'unknown'

    if (!isAuthorizedAdminIP(clientIp)) {
      return Response.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    // Detectar pruebas sospechosas
    const suspiciousResult = await query(`
      SELECT 
        id,
        user_name,
        download_speed,
        upload_speed,
        ping,
        created_at,
        CASE 
          WHEN upload_speed > download_speed * 0.8 THEN 'upload_too_high'
          WHEN download_speed > 100000 THEN 'impossible_speed'
          WHEN ping < 0.5 THEN 'impossible_ping'
          ELSE NULL
        END as anomaly_type
      FROM results
      WHERE upload_speed > download_speed * 0.8
        OR download_speed > 100000
        OR ping < 0.5
      ORDER BY created_at DESC
      LIMIT 50
    `)

    // Usuarios con múltiples pruebas rápidas
    const rapidTestersResult = await query(`
      SELECT 
        user_name,
        ip_address,
        COUNT(*) as test_count,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as last_hour_count,
        MIN(created_at) as first_test,
        MAX(created_at) as last_test,
        AVG(download_speed) as avg_speed,
        STDDEV(download_speed) as speed_variance
      FROM results
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY user_name, ip_address
      HAVING COUNT(*) > 3
      ORDER BY last_hour_count DESC, COUNT(*) DESC
    `)

    // Estadísticas de tiempo de respuesta
    const timeStatsResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as last_hour,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_week,
        COUNT(*) as total
      FROM results
    `)

    // Distribución de velocidades
    const speedDistributionResult = await query(`
      SELECT 
        CASE 
          WHEN download_speed < 10 THEN 'Muy Lento (<10 Mbps)'
          WHEN download_speed < 30 THEN 'Lento (10-30 Mbps)'
          WHEN download_speed < 100 THEN 'Normal (30-100 Mbps)'
          WHEN download_speed < 300 THEN 'Rápido (100-300 Mbps)'
          WHEN download_speed < 1000 THEN 'Muy Rápido (300-1000 Mbps)'
          ELSE 'Ultra Rápido (>1000 Mbps)'
        END as speed_range,
        COUNT(*) as count,
        ROUND(AVG(download_speed), 2) as avg_speed
      FROM results
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY speed_range
      ORDER BY download_speed
    `)

    // IPs potencialmente sospechosas
    const suspiciousIpsResult = await query(`
      SELECT 
        ip_address,
        COUNT(*) as total_tests,
        COUNT(DISTINCT user_name) as unique_users,
        AVG(download_speed) as avg_speed,
        STDDEV(download_speed) as variance,
        MAX(created_at) as last_test
      FROM results
      WHERE ip_address IS NOT NULL
        AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY ip_address
      HAVING COUNT(DISTINCT user_name) > 1 
        OR STDDEV(download_speed) > 500
        OR COUNT(*) > 10
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `)

    const timeStats = timeStatsResult.rows[0] || {
      last_hour: 0,
      last_24h: 0,
      last_week: 0,
      total: 0
    }

    return Response.json({
      success: true,
      anomalies: {
        suspicious: suspiciousResult.rows.map((row: any) => ({
          id: row.id,
          user: row.user_name,
          download: parseFloat(row.download_speed).toFixed(2),
          upload: parseFloat(row.upload_speed).toFixed(2),
          ping: parseFloat(row.ping).toFixed(1),
          type: row.anomaly_type,
          date: row.created_at
        }))
      },
      rapidTesters: rapidTestersResult.rows.map((row: any) => ({
        user: row.user_name,
        ip: row.ip_address,
        totalTests: row.test_count,
        lastHourTests: row.last_hour_count,
        avgSpeed: parseFloat(row.avg_speed).toFixed(2),
        variance: row.speed_variance ? parseFloat(row.speed_variance).toFixed(2) : '0',
        firstTest: row.first_test,
        lastTest: row.last_test
      })),
      timeline: {
        lastHour: parseInt(timeStats.last_hour || 0),
        last24h: parseInt(timeStats.last_24h || 0),
        lastWeek: parseInt(timeStats.last_week || 0),
        total: parseInt(timeStats.total || 0)
      },
      speedDistribution: speedDistributionResult.rows.map((row: any) => ({
        range: row.speed_range,
        count: row.count,
        avgSpeed: parseFloat(row.avg_speed).toFixed(2)
      })),
      suspiciousIps: suspiciousIpsResult.rows.map((row: any) => ({
        ip: row.ip_address,
        totalTests: row.total_tests,
        uniqueUsers: row.unique_users,
        avgSpeed: parseFloat(row.avg_speed).toFixed(2),
        variance: row.variance ? parseFloat(row.variance).toFixed(2) : '0',
        lastTest: row.last_test
      }))
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return Response.json(
      { error: 'Error al obtener análisis' },
      { status: 500 }
    )
  }
}
