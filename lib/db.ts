import { Pool, QueryResult, QueryResultRow } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function initializeDatabase() {
  try {
    // Create results table
    await query(`
      CREATE TABLE IF NOT EXISTS results (
        id BIGSERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        download_speed FLOAT NOT NULL,
        upload_speed FLOAT NOT NULL,
        ping FLOAT NOT NULL,
        city VARCHAR(255),
        country VARCHAR(255),
        isp VARCHAR(255),
        ip_address VARCHAR(255),
        rank INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create index on download_speed for faster ranking queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_results_download_speed 
      ON results(download_speed DESC)
    `)

    // Create index on created_at for time-based queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_results_created_at 
      ON results(created_at DESC)
    `)

    // Create rate_limits table
    await query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        ip_address VARCHAR(255) PRIMARY KEY,
        request_count INTEGER DEFAULT 1,
        last_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hour_requests INTEGER DEFAULT 1,
        last_hour_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create index for cleanup queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_last_request
      ON rate_limits(last_request)
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export default pool
