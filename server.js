const http = require('http')
const { exec } = require('child_process')
const url = require('url')

const PORT = process.env.PORT || 3001

/**
 * Ejecuta speedtest-cli con reintentos
 */
function runSpeedtest(retries = 3) {
  return new Promise((resolve, reject) => {
    const attemptSpeedtest = (attempt) => {
      console.log(`Intento de prueba ${attempt + 1}/${retries}...`)

      exec('speedtest-cli --simple 2>&1', { timeout: 600000, maxBuffer: 10 * 1024 * 1024, shell: '/bin/bash' }, (error, stdout, stderr) => {
        console.log(`[Intento ${attempt + 1}] Raw output:`, stdout)
        console.log(`[Intento ${attempt + 1}] Stderr:`, stderr)
        
        if (error) {
          console.error(`Intento ${attempt + 1} falló:`, error.message)

          if (attempt < retries - 1) {
            console.log(`Reintentando en 3 segundos...`)
            setTimeout(() => attemptSpeedtest(attempt + 1), 3000)
          } else {
            reject(new Error(`Falló después de ${retries} intentos: ${error.message}`))
          }
          return
        }

        const lines = stdout.trim().split('\n').filter(line => line.trim())
        
        console.log(`[Intento ${attempt + 1}] Lines parsed:`, lines)
        
        if (lines.length < 3) {
          console.error(`Formato inválido en intento ${attempt + 1}: esperaba 3 líneas, obtuve ${lines.length}`)
          
          if (attempt < retries - 1) {
            setTimeout(() => attemptSpeedtest(attempt + 1), 3000)
          } else {
            reject(new Error(`Formato de respuesta inválido después de ${retries} intentos`))
          }
          return
        }

        const ping = parseFloat(lines[0])
        const download = parseFloat(lines[1]) / 1000 // kbps a Mbps
        const upload = parseFloat(lines[2]) / 1000

        console.log(`[Intento ${attempt + 1}] Parsed values:`, { ping, download, upload })

        // Validar que los valores sean válidos
        if (isNaN(ping) || isNaN(download) || isNaN(upload) || download === 0 || upload === 0) {
          console.error(`Valores inválidos en intento ${attempt + 1}:`, { ping, download, upload })
          
          if (attempt < retries - 1) {
            setTimeout(() => attemptSpeedtest(attempt + 1), 3000)
          } else {
            reject(new Error('No se pudieron obtener valores válidos después de múltiples intentos'))
          }
          return
        }

        console.log(`✓ Prueba completada: Ping=${ping}ms, Download=${download}Mbps, Upload=${upload}Mbps`)
        resolve({
          ping: Math.max(ping, 0.1),
          download: Math.max(download, 0.1),
          upload: Math.max(upload, 0.05),
          timestamp: new Date().toISOString()
        })
      })
    }

    attemptSpeedtest(0)
  })
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // GET /speedtest - ejecutar prueba
  if (parsedUrl.pathname === '/speedtest' && req.method === 'GET') {
    console.log('═══════════════════════════════════')
    console.log('Iniciando prueba de velocidad real...')
    console.log('═══════════════════════════════════')

    runSpeedtest(3)
      .then((result) => {
        res.writeHead(200)
        res.end(JSON.stringify({
          success: true,
          ping: result.ping,
          download: result.download,
          upload: result.upload,
          timestamp: result.timestamp
        }))
      })
      .catch((error) => {
        console.error('Error en prueba de velocidad:', error)
        res.writeHead(500)
        res.end(JSON.stringify({
          success: false,
          error: error.message || 'Error desconocido en speedtest-cli'
        }))
      })
    return
  }

  // GET /health - verificar servidor
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200)
    res.end(JSON.stringify({ status: 'ok', service: 'speedtest-server' }))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }))
})

server.listen(PORT, () => {
  console.log(`✓ Servidor speedtest ejecutándose en puerto ${PORT}`)
  console.log(`✓ Endpoint: GET /speedtest`)
  console.log(`✓ Health check: GET /health`)
})
