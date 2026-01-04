const http = require('http')
const { exec } = require('child_process')
const url = require('url')

const PORT = process.env.PORT || 3001

/**
 * Rate limiter simple basado en IP
 */
const requestCounts = new Map()
const MAX_REQUESTS_PER_MINUTE = 5
const WINDOW_SIZE = 60 * 1000 // 1 minuto

function checkRateLimit(ip) {
  const now = Date.now()
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, [])
  }
  
  const timestamps = requestCounts.get(ip)
  const recentRequests = timestamps.filter(t => now - t < WINDOW_SIZE)
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false
  }
  
  recentRequests.push(now)
  requestCounts.set(ip, recentRequests)
  return true
}

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

        // Extraer valores del formato "Ping: X ms", "Download: X Mbit/s", "Upload: X Mbit/s"
        const pingMatch = lines[0].match(/[\d.]+/)
        const downloadMatch = lines[1].match(/[\d.]+/)
        const uploadMatch = lines[2].match(/[\d.]+/)

        const ping = pingMatch ? parseFloat(pingMatch[0]) : NaN
        const download = downloadMatch ? parseFloat(downloadMatch[0]) : NaN
        const upload = uploadMatch ? parseFloat(uploadMatch[0]) : NaN

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

  // CORS - Restringido solo a NEXT_PUBLIC_SITE_URL
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://wifitop.vercel.app'
  const origin = req.headers.origin
  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // GET /speedtest - ejecutar prueba
  if (parsedUrl.pathname === '/speedtest' && req.method === 'GET') {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown'
    
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit excedido para IP: ${clientIp}`)
      res.writeHead(429, { 'Retry-After': '60' })
      res.end(JSON.stringify({
        success: false,
        error: 'Demasiadas solicitudes. Máximo 5 pruebas por minuto.'
      }))
      return
    }

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
