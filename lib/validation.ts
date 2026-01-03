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

  const { downloadSpeed, uploadSpeed, ping } = result

  if (typeof downloadSpeed !== 'number' || downloadSpeed < 0) {
    return { valid: false, error: 'Velocidad de descarga inválida' }
  }

  if (typeof uploadSpeed !== 'number' || uploadSpeed < 0) {
    return { valid: false, error: 'Velocidad de subida inválida' }
  }

  if (typeof ping !== 'number' || ping < 0) {
    return { valid: false, error: 'Ping inválido' }
  }

  return { valid: true }
}
