export function validateUserName(name: string): { valid: boolean; error?: string } {
  if (!name?.trim()) return { valid: false, error: 'Nombre requerido' }
  const trimmed = name.trim()
  if (trimmed.length < 2) return { valid: false, error: 'Mínimo 2 caracteres' }
  if (trimmed.length > 30) return { valid: false, error: 'Máximo 30 caracteres' }
  if (!/^[a-zA-Z0-9\s\-_.áéíóúÁÉÍÓÚñÑ]+$/.test(trimmed)) {
    return { valid: false, error: 'Caracteres inválidos' }
  }
  return { valid: true }
}

export function validateSpeedResult(result: any): { valid: boolean; error?: string } {
  if (!result) return { valid: false, error: 'Resultado inválido' }

  const { downloadSpeed, uploadSpeed, ping } = result

  if (typeof downloadSpeed !== 'number' || downloadSpeed < 0 || downloadSpeed > 1000000) {
    return { valid: false, error: 'Velocidad de descarga inválida' }
  }
  if (typeof uploadSpeed !== 'number' || uploadSpeed < 0 || uploadSpeed > 1000000) {
    return { valid: false, error: 'Velocidad de subida inválida' }
  }
  if (uploadSpeed > downloadSpeed * 2) {
    return { valid: false, error: 'Datos incoherentes' }
  }
  if (typeof ping !== 'number' || ping < 0 || ping > 10000) {
    return { valid: false, error: 'Ping inválido' }
  }

  return { valid: true }
}

export function detectFraud(result: any): { fraud: boolean; reason?: string } {
  if (result.downloadSpeed > 100000) return { fraud: true, reason: 'Velocidad imposible' }
  if (result.ping < 0.1) return { fraud: true, reason: 'Ping imposible' }
  if (result.uploadSpeed > result.downloadSpeed * 1.2) return { fraud: true, reason: 'Upload sospechoso' }
  if (result.downloadSpeed === result.uploadSpeed && result.downloadSpeed > 0) {
    return { fraud: true, reason: 'Speeds idénticas' }
  }
  return { fraud: false }
}
