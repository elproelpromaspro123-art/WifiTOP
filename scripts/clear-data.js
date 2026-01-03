const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function clearData() {
  try {
    console.log('Iniciando limpieza de datos de base de datos...')

    // Eliminar todos los registros de la tabla results
    const result = await pool.query('DELETE FROM results')

    console.log(`✓ Se eliminaron ${result.rowCount} registros de la tabla results`)
    console.log('✓ La estructura de la base de datos se mantiene intacta')
    console.log('\nLimpieza completada exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('Error al limpiar datos:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

clearData()
