(async () => {
  try {
    const url = 'http://localhost:3000/api/speedtest/download-proxy?duration=30000'
    console.log('Starting download test to', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)

    // Work with web stream if available, otherwise Node stream
    const start = Date.now()
    let total = 0

    if (res.body && typeof res.body.getReader === 'function') {
      const reader = res.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        total += value.byteLength || value.length || 0
      }
    } else if (res.body && typeof res.body.on === 'function') {
      await new Promise((resolve, reject) => {
        res.body.on('data', (chunk) => { total += chunk.length })
        res.body.on('end', resolve)
        res.body.on('error', reject)
      })
    } else {
      const b = await res.arrayBuffer()
      total = b.byteLength
    }

    const ms = Date.now() - start
    const mbps = (total * 8) / (ms / 1000) / 1_000_000
    console.log('Download test finished:', { bytes: total, durationMs: ms, speedMbps: mbps.toFixed(2) })
  } catch (e) {
    console.error('Download test error:', e)
  }
})()
