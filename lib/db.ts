import { Pool, QueryResult, QueryResultRow } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params)
}

export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS results (
      id BIGSERIAL PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      download_speed FLOAT NOT NULL,
      upload_speed FLOAT NOT NULL,
      ping FLOAT NOT NULL,
      country VARCHAR(255),
      isp VARCHAR(255),
      ip_address VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await query(`CREATE INDEX IF NOT EXISTS idx_results_download ON results(download_speed DESC)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_results_created ON results(created_at DESC)`)

  await query(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      ip_address VARCHAR(255) PRIMARY KEY,
      request_count INTEGER DEFAULT 1,
      last_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      hour_requests INTEGER DEFAULT 1,
      last_hour_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export default pool
