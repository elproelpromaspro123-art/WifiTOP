export function validateUserName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre es requerido' }
  }

  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' }
  }

  if (trimmed.length > 255) {
    return { valid: false, error: 'El nombre no puede exceder 255 caracteres' }
  }

  if (!/^[a-zA-Z0-9\s\-_.áéíóúÁÉÍÓÚñÑ]+$/.test(trimmed)) {
    return { valid: false, error: 'El nombre contiene caracteres inválidos' }
  }

  return { valid: true }
}

export function validateSpeedTestResult(result: any): { valid: boolean; error?: string } {
  if (!result || typeof result !== 'object') {
    return { valid: false, error: 'Resultado inválido' }
  }

  const { downloadSpeed, uploadSpeed, ping, jitter, stability } = result

  // Validar descarga
  if (typeof downloadSpeed !== 'number' || downloadSpeed < 0 || downloadSpeed > 1000000) {
    return { valid: false, error: 'Velocidad de descarga inválida' }
  }

  // Validar subida
  if (typeof uploadSpeed !== 'number' || uploadSpeed < 0 || uploadSpeed > 1000000) {
    return { valid: false, error: 'Velocidad de subida inválida' }
  }

  // Upload no debe ser >150% de download (sanity check)
  if (uploadSpeed > downloadSpeed * 1.5) {
    return { valid: false, error: 'Datos de subida incoherentes' }
  }

  // Validar ping
  if (typeof ping !== 'number' || ping < 0 || ping > 10000) {
    return { valid: false, error: 'Ping inválido' }
  }

  // Validar jitter si existe
  if (jitter !== undefined && typeof jitter === 'number') {
    if (jitter < 0 || jitter > ping || jitter > 1000) {
      return { valid: false, error: 'Jitter inválido' }
    }
  }

  // Validar estabilidad si existe
  if (stability !== undefined && typeof stability === 'number') {
    if (stability < 0 || stability > 100) {
      return { valid: false, error: 'Estabilidad inválida' }
    }
  }

  // Test incompleto
  if (downloadSpeed === 0 && uploadSpeed === 0 && ping === 0) {
    return { valid: false, error: 'Prueba incompleta' }
  }

  return { valid: true }
}

/**
 * Detecta anomalías y potencial fraude con scoring granular
 */
export function detectAnomalies(result: any, previousResults: any[] = []): {
  anomaly: boolean
  reason?: string
  confidence?: number
  flags?: string[]
} {
  const flags: string[] = []
  let anomalyScore = 0

  // Flag 1: Velocidad imposiblemente rápida (>100Gbps)
  if (result.downloadSpeed > 100000) {
    flags.push('impossible_download_speed')
    anomalyScore += 3
  }

  // Flag 2: Upload mayor que 80% del download (raro pero sospechoso)
  if (result.uploadSpeed > result.downloadSpeed * 0.8) {
    flags.push('upload_too_high')
    anomalyScore += 2
  }

  // Flag 3: Ping imposible (<0.1ms)
  if (result.ping < 0.1) {
    flags.push('impossible_ping')
    anomalyScore += 3
  }

  // Flag 4: Jitter muy alto (>50% del ping)
  if (result.jitter && result.jitter > result.ping * 0.5) {
    flags.push('high_jitter')
    anomalyScore += 1
  }

  // Flag 5: Estabilidad imposible
  if (result.stability !== undefined && (result.stability < 0 || result.stability > 100)) {
    flags.push('invalid_stability')
    anomalyScore += 2
  }

  // Flag 6: Variación extrema con pruebas anteriores
  if (previousResults.length > 0) {
    const avgPreviousSpeed = previousResults.reduce((sum, r) => sum + r.downloadSpeed, 0) / previousResults.length
    const minPrevious = Math.min(...previousResults.map(r => r.downloadSpeed))
    const maxPrevious = Math.max(...previousResults.map(r => r.downloadSpeed))

    if (result.downloadSpeed < minPrevious * 0.3 || result.downloadSpeed > maxPrevious * 3) {
      flags.push('extreme_deviation')
      anomalyScore += 1.5
    }

    const deviation = Math.abs(result.downloadSpeed - avgPreviousSpeed) / (avgPreviousSpeed || 1)
    if (deviation > 5) {
      flags.push('huge_variance')
      anomalyScore += 1
    }
  }

  // Flag 7: Test incompleto
  if (result.downloadSpeed === 0 && result.uploadSpeed === 0 && result.ping === 0) {
    flags.push('incomplete_test')
    anomalyScore += 2
  }

  // Flag 8: Download y upload idénticos
  if (Math.abs(result.downloadSpeed - result.uploadSpeed) < 0.01 && result.downloadSpeed > 0) {
    flags.push('identical_speeds')
    anomalyScore += 1.5
  }

  // Flag 9: Números redondos sospechosos
  if (
    result.downloadSpeed % 100 === 0 &&
    result.downloadSpeed !== 0 &&
    result.downloadSpeed < 1000
  ) {
    flags.push('suspiciously_round')
    anomalyScore += 0.5
  }

  const confidence = Math.min(100, anomalyScore * 20)
  const isAnomaly = anomalyScore >= 2

  return {
    anomaly: isAnomaly,
    reason: isAnomaly ? `Anomalía detectada (${flags.join(', ')})` : undefined,
    confidence: Math.round(confidence),
    flags: flags.length > 0 ? flags : undefined
  }
}
