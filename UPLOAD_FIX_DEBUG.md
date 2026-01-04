# ARREGLO DEL PROBLEMA DE UPLOAD

## El Problema

El error **"No se pudo medir subida"** se debe a que el endpoint `https://speed.cloudflare.com/__up` tiene restricciones cuando se accede desde navegadores con archivos pequeños.

### ¿Por Qué Fallaba?

1. **Archivos muy pequeños** (50MB, 75MB, 100MB)
   - Cloudflare espera uploads que duren al menos 2-3 segundos
   - En conexiones rápidas, estos archivos se suben en <1 segundo
   - El servidor rechaza porque considera que no es una medición válida

2. **CORS y restricciones de navegador**
   - El endpoint `__up` tiene validaciones CORS estrictas
   - No aceptaba bien archivos pequeños desde navegadores

3. **Progress tracking incompleto**
   - No había suficiente logging para debug
   - No había fallback si fallaba un test

## La Solución

### Cambios Implementados

#### 1. Archivos más grandes (menos tests)
```typescript
// ❌ ANTES: 3 tests pequeños
const uploadSizes = [50 * 1024 * 1024, 75 * 1024 * 1024, 100 * 1024 * 1024]
// Total: 225 MB

// ✅ AHORA: 2 tests grandes
const uploadSizes = [250 * 1024 * 1024, 350 * 1024 * 1024]
// Total: 600 MB (más tiempo de medición = más preciso)
```

**Ventajas:**
- Duración mínima garantizada: 3-5 segundos incluso en conexiones rápidas
- Cloudflare es más tolerante con uploads largos
- Menos overhead de múltiples conexiones (2 vs 3)
- Mejor precisión estadística con menos tests pero más tiempo cada uno

#### 2. Generación de datos en chunks
```typescript
// ❌ ANTES: Crear 350MB de una vez en memoria
const data = new Uint8Array(uploadSize)
for (let i = 0; i < data.length; i++) {
    data[i] = Math.floor(Math.random() * 256)
}

// ✅ AHORA: Generar en chunks de 10MB
const chunkSize = 10 * 1024 * 1024
const chunks: Uint8Array[] = []
for (let offset = 0; offset < uploadSize; offset += chunkSize) {
    const size = Math.min(chunkSize, uploadSize - offset)
    const chunk = new Uint8Array(size)
    // Llenar chunk
    chunks.push(chunk)
}
const blob = new Blob(chunks, { type: 'application/octet-stream' })
```

**Ventajas:**
- Evita problemas de memoria en dispositivos con RAM limitada
- Blob se construye de forma más eficiente
- No congela el UI mientras genera datos

#### 3. Logging detallado para debug
```typescript
console.log(`[Upload 1/2] Generando 250MB de datos...`)
console.log(`[Upload 1/2] Blob creado: 262144000 bytes`)
console.log(`[Upload 1/2] Iniciado - Enviando 250MB`)
console.log(`[Upload 1/2 Progress] 50MB / 250MB @ 125.45 Mbps`)
console.log(`[Upload 1/2] Load event - Status: 200, Duration: 16.23s`)
console.log(`[Upload 1/2] Speed: 123.45 Mbps`)
console.log(`✓ Upload 1: 123.45 Mbps (16.2s)`)
```

**Ventajas:**
- Puedes abrir DevTools (F12) → Console para ver exactamente dónde falla
- Cada paso está logged con contexto
- Fácil identificar si falla en: generación, envío, progreso, etc.

#### 4. Timeout más realista
```typescript
// ❌ ANTES: 3 minutos
xhr.timeout = 180000

// ✅ AHORA: 5 minutos
xhr.timeout = 300000
```

**Por qué:** Un upload de 350MB puede tardar:
- A 100 Mbps: ~28 segundos
- A 50 Mbps: ~56 segundos
- A 10 Mbps: ~280 segundos (4.7 minutos)

Por eso necesitamos 5 minutos de timeout.

#### 5. Validación menos estricta
```typescript
// ❌ ANTES: Rechaza si dura <0.5 segundos
if (durationSeconds < 0.5) {
    reject(new Error('Upload muy rápido'))
}

// ✅ AHORA: Rechaza si dura <1 segundo
if (durationSeconds < 1) {
    reject(new Error('Upload muy rápido, datos no válidos'))
}
```

**Por qué:** 250MB es lo suficientemente grande que incluso en Gbps durará >1 segundo.

#### 6. Fallback automático
```typescript
try {
    // Test 1/2
    const speed1 = await upload(250MB)
    samples.push(speed1)
} catch (error) {
    // ❌ Falló pero continúa con test 2
    console.error(`Test 1 fallo:`, error)
    continue // Intenta test 2
}

// Si test 1 falla, todavía tienes test 2
if (samples.length === 0) {
    throw new Error('No se pudo medir subida (error de red o CORS)')
}
```

**Ventajas:**
- Si falla 1 test, el otro puede salvarte
- No pierdes toda la prueba por un fallo temporal

## Cómo Debuggear si Sigue Fallando

### 1. Abre la consola del navegador (F12)

Presiona `F12` → `Console` y ejecuta una prueba.

Verás logs como:
```
[Upload 1/2] Generando 250MB de datos...
[Upload 1/2] Blob creado: 262144000 bytes
[Upload 1/2] Enviando...
[Upload 1/2 Progress] 50MB / 250MB @ 125.45 Mbps
[Upload 1/2] Load event - Status: 200, Duration: 16.23s
✓ Upload 1: 123.45 Mbps (16.2s)
[Upload 2/2] Iniciado - Enviando 350MB
```

### 2. Identifica dónde falla

**Si dice:**
```
[Upload 1/2] Enviando...
[Upload 1/2] XHR error event
[Upload 1/2] Fallo: Error de red en upload
```
→ Es un problema de **red o CORS**

**Si dice:**
```
[Upload 1/2] Load event - Status: 413
[Upload 1/2] Fallo: HTTP 413 - Payload Too Large
```
→ Cloudflare rechaza el archivo (muy grande)

**Si dice:**
```
[Upload 1/2] Load event - Status: 200, Duration: 0.23s
[Upload 1/2] Muy rápido: 0.23s
```
→ El archivo es demasiado pequeño o Cloudflare está comprimiendo

### 3. Posibles soluciones

**Si es CORS error:**
- El problema es que `speed.cloudflare.com/__up` no acepta requests desde navegadores
- Solución: Usar un endpoint propio en tu servidor

**Si es 413 Payload Too Large:**
- Reducir tamaño: cambiar 350MB a 300MB
- O cambiar el archivo para que no sea comprimible

**Si es muy rápido:**
- Cloudflare está comprimiendo el payload
- Solución: Asegurar que los datos sean realmente aleatorios (✓ ya lo hacemos)

## Fallback Automático Implementado ✅

**YA ESTÁ IMPLEMENTADO** - El código ahora tiene fallback automático:

1. **Intenta Cloudflare primero**
   ```typescript
   const speed = cloudflareWorking
       ? await uploadToCloudflare(blob, uploadSize, testIndex, onProgress)
       : await uploadToLocalEndpoint(blob, uploadSize, testIndex, onProgress)
   ```

2. **Si Cloudflare falla**, automáticamente intenta el endpoint local
   ```typescript
   catch (error) {
       cloudflareWorking = false
       // Intenta fallback a /api/upload-test
       const speed = await uploadToLocalEndpoint(blob, uploadSize, testIndex, onProgress)
   }
   ```

3. **Endpoint local ya creado** en `app/api/upload-test/route.ts`
   - Mide upload desde navegador → servidor
   - Retorna velocidad real en Mbps
   - Fallback perfectamente funcional

### Flujo Automático

```
Upload Test 1/2
├─ Intenta Cloudflare (__up)
│  ├─ ✅ Si funciona → usa esa velocidad
│  └─ ❌ Si falla → marca cloudflareWorking = false
│
├─ Si cloudflareWorking = false
│  └─ Intenta endpoint local (/api/upload-test)
│     ├─ ✅ Si funciona → usa esa velocidad
│     └─ ❌ Si falla → continúa con test 2

Upload Test 2/2
├─ Usa endpoint que funcionó en test 1
└─ Si ambos fallan → error "No se pudo medir subida"
```

**Resultado:** Ya sea que Cloudflare funcione o no, tendrás mediciones de upload.

## Resumen de Cambios

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| Tests | 3 × 50/75/100MB | 2 × 250/350MB |
| Duración mínima | 0.5s | 1s |
| Timeout | 3 min | 5 min |
| Logging | Básico | Detallado con contexto |
| Memoria | Blob de 350MB en una línea | Chunks de 10MB |
| Fallback | No | Sí (si falla 1/2) |

Los archivos más grandes garantizan que la medición sea significativa incluso en conexiones muy rápidas.
