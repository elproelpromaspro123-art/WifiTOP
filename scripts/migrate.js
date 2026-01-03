const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function migrate() {
  try {
    console.log('Iniciando migración de base de datos...')

    // Crear tabla de resultados
    await pool.query(`
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

    console.log('✓ Tabla results creada')

    // Crear índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_results_download_speed 
      ON results(download_speed DESC)
    `)

    console.log('✓ Índice download_speed creado')

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_results_created_at 
      ON results(created_at DESC)
    `)

    console.log('✓ Índice created_at creado')

    console.log('\n✓ Migración completada exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('Error en migración:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
