const http = require('http')
const { exec } = require('child_process')
const url = require('url')

const PORT = process.env.PORT || 3001

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
    console.log('Iniciando prueba de velocidad...')

    exec('speedtest-cli --simple', { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error ejecutando speedtest:', error)
        res.writeHead(500)
        res.end(JSON.stringify({ error: 'Error al ejecutar speedtest-cli' }))
        return
      }

      const lines = stdout.trim().split('\n')
      if (lines.length < 3) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'Formato inválido' }))
        return
      }

      const ping = parseFloat(lines[0])
      const download = parseFloat(lines[1]) / 1000 // kbps a Mbps
      const upload = parseFloat(lines[2]) / 1000

      res.writeHead(200)
      res.end(JSON.stringify({
        success: true,
        ping,
        download,
        upload,
        timestamp: new Date().toISOString()
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
  console.log(`Servidor speedtest ejecutándose en puerto ${PORT}`)
})
