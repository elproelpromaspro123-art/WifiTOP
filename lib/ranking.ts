import { query } from './db'

const TOP_RESULTS_LIMIT = 1000

export interface RankingResult {
  id: number
  rank: number
  userName: string
  downloadSpeed: number
  uploadSpeed: number
  ping: number
  city?: string
  country?: string
  isp?: string
  createdAt: Date
}

/**
 * Obtiene el ranking actual (top 1000)
 */
export async function getTopResults(limit: number = TOP_RESULTS_LIMIT) {
  try {
    const result = await query<RankingResult>(
      `
      SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY download_speed DESC) as rank,
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
      LIMIT $1
      `,
      [limit]
    )
    return result.rows
  } catch (error) {
    console.error('Error getting top results:', error)
    throw error
  }
}

/**
 * Obtiene el valor mínimo de velocidad en el top 1000
 */
export async function getMinimumTopSpeed() {
  try {
    const result = await query<{ min_speed: number }>(
      `
      SELECT MIN(download_speed) as min_speed
      FROM (
        SELECT download_speed
        FROM results
        ORDER BY download_speed DESC
        LIMIT $1
      ) as top_results
      `,
      [TOP_RESULTS_LIMIT]
    )
    return result.rows[0]?.min_speed || 0
  } catch (error) {
    console.error('Error getting minimum top speed:', error)
    throw error
  }
}

/**
 * Cuenta total de resultados en la base de datos
 */
export async function getTotalResultsCount() {
  try {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM results`
    )
    return parseInt(result.rows[0]?.count || '0', 10)
  } catch (error) {
    console.error('Error getting total count:', error)
    throw error
  }
}

/**
 * Obtiene el rango de un usuario específico si está en top 1000
 */
export async function getUserRank(userId: number) {
  try {
    const result = await query<{ rank: number }>(
      `
      SELECT ROW_NUMBER() OVER (ORDER BY download_speed DESC) as rank
      FROM results
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    )
    const rank = result.rows[0]?.rank
    return rank && rank <= TOP_RESULTS_LIMIT ? rank : null
  } catch (error) {
    console.error('Error getting user rank:', error)
    throw error
  }
}

/**
 * Mantiene el ranking limitado a 1000 resultados
 * Elimina resultados con velocidades más bajas cuando se excede el límite
 */
export async function maintainRanking() {
  try {
    // Obtener el ID del resultado con la menor velocidad en el top 1000
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM results`
    )
    
    const totalCount = parseInt(countResult.rows[0]?.count || '0', 10)
    
    if (totalCount > TOP_RESULTS_LIMIT) {
      // Obtener la velocidad mínima del top 1000
      const minResult = await query<{ download_speed: number }>(
        `
        SELECT download_speed
        FROM results
        ORDER BY download_speed DESC
        LIMIT 1 OFFSET $1
        `,
        [TOP_RESULTS_LIMIT - 1]
      )
      
      const minSpeed = minResult.rows[0]?.download_speed
      
      // Eliminar resultados con velocidad menor que la mínima del top 1000
      await query(
        `
        DELETE FROM results
        WHERE download_speed < $1
        AND id NOT IN (
          SELECT id FROM results
          ORDER BY download_speed DESC
          LIMIT $2
        )
        `,
        [minSpeed, TOP_RESULTS_LIMIT]
      )
    }
  } catch (error) {
    console.error('Error maintaining ranking:', error)
    throw error
  }
}
