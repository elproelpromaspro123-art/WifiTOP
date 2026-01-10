const { Readable } = require('stream')
;(async () => {
  try {
    const url = 'http://localhost:3000/api/speedtest/upload-proxy'
    console.log('Starting upload test to', url)

    const chunk = Buffer.alloc(64 * 1024, 0)
    const stream = new Readable({ read() {} })

    const start = Date.now()
    const pushLoop = () => {
      const elapsed = Date.now() - start
      if (elapsed > 30000) { // 30s
        stream.push(null)
        return
      }
      const ok = stream.push(chunk)
      // Use setImmediate to avoid blocking event loop
      setImmediate(pushLoop)
    }

    setImmediate(pushLoop)

    const res = await fetch(url, { method: 'POST', body: stream, headers: { 'Content-Type': 'application/octet-stream' } })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const json = await res.json()
    console.log('Upload test finished:', json)
  } catch (e) {
    console.error('Upload test error:', e)
  }
})()
