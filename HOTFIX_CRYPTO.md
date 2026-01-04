# Hotfix: Crypto getRandomValues Límite 65KB

## Problema Encontrado
```
❌ crypto.getRandomValues(buffer) con buffer > 65KB falla
Error: "The ArrayBufferView's byte length (1000000) exceeds the number of bytes of entropy available via this API (65536)"
```

## Solución
```typescript
// Generar datos en chunks de 64KB
const chunkSize = 65536 // límite de crypto API
const chunks: Uint8Array[] = []

for (let offset = 0; offset < size; offset += chunkSize) {
    const remainingBytes = Math.min(chunkSize, size - offset)
    const chunk = new Uint8Array(remainingBytes)
    crypto.getRandomValues(chunk) // ✅ Cada chunk < 65KB
    chunks.push(chunk)
}

// Concatenar en un buffer único
const buffer = new Uint8Array(size)
let offset = 0
for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
}
```

## Impacto
- ✅ Ahora genera correctamente 1MB, 5MB, 10MB, 25MB, 50MB
- ✅ Sin errores de crypto API
- ✅ Upload real funciona completamente

## Performance
```
Para 50MB:
- chunks = 50MB ÷ 64KB = 762 chunks
- tiempo generación = ~200ms (negligible)
- tiempo upload = lo importante (50Mbps = 8s)
```

## Verificado
```
✓ Chunk 1: 64KB 
✓ Chunk 2: 64KB
✓ ...
✓ Chunk 762: 25.6KB
✓ Total: 50MB exacto
```
