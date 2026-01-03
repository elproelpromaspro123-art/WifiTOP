'use client'

import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')

  const runTest = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setProgress(0)
    setStatus('Iniciando...')

    try {
      // Importar directamente la función para probar
      const { simulateSpeedTestImproved: simulateSpeedTest } = await import('@/lib/speedtest-improved')
      
      const result = await simulateSpeedTest((progress, status, details) => {
        setProgress(progress)
        setStatus(status)
      })

      if (!result) {
        setError('No se obtuvieron resultados')
        return
      }

      setResult(result)
      setProgress(100)
      setStatus('Completado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test de SpeedTest</h1>
      
      <button 
        onClick={runTest} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? `Ejecutando prueba (${Math.round(progress)}%)...` : 'Iniciar Prueba'}
      </button>

      {loading && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '10px' }}>
            Estado: {status}
          </div>
          <div style={{ backgroundColor: '#e0e0e0', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
            <div 
              style={{
                backgroundColor: '#1976d2',
                height: '100%',
                width: `${Math.round(progress)}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ marginTop: '10px', color: '#666', fontSize: '12px' }}>
            Progreso: {Math.round(progress)}%
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '20px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '4px' }}>
          <h2>Resultados:</h2>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Descarga</td>
                <td style={{ padding: '8px' }}>{result.downloadSpeed} Mbps</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Subida</td>
                <td style={{ padding: '8px' }}>{result.uploadSpeed} Mbps</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Ping</td>
                <td style={{ padding: '8px' }}>{result.ping} ms</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Jitter</td>
                <td style={{ padding: '8px' }}>{result.jitter} ms</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Estabilidad</td>
                <td style={{ padding: '8px' }}>{result.stability}%</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Min Descarga</td>
                <td style={{ padding: '8px' }}>{result.minDownload} Mbps</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Max Descarga</td>
                <td style={{ padding: '8px' }}>{result.maxDownload} Mbps</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ marginTop: '20px' }}>JSON Completo:</h3>
          <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px' }}>
        <strong>⚡ Instrucciones:</strong>
        <ol>
          <li><strong>Haz clic en "Iniciar Prueba"</strong></li>
          <li><strong>Espera 1-2 MINUTOS</strong> (no cierres la pestaña, no uses internet)</li>
          <li>Verás:
            <ul>
              <li>Barra de progreso en tiempo real</li>
              <li>Estado actual (Ping → Descarga → Subida)</li>
              <li>% completado</li>
            </ul>
          </li>
          <li>Abre DevTools (F12) → Console para ver logs detallados</li>
          <li>Los resultados aparecerán cuando complete al 100%</li>
        </ol>

        <strong style={{ color: '#d32f2f' }}>⚠️ Importante:</strong>
        <ul>
          <li>✅ Prueba requiere descargar/subir ~90-110MB de datos</li>
          <li>✅ Durará 60-90 segundos aprox.</li>
          <li>✅ Mide REALES: no simuladas</li>
          <li>✅ Proporciona resultados más precisos que la versión anterior</li>
          <li>✅ Ping más preciso (filtra outliers automáticamente)</li>
        </ul>
      </div>
    </div>
  )
}
