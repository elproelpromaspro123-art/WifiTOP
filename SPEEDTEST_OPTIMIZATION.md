# WiFi Speed Test - Optimización para Máximo Rendimiento

## Arquitectura Nueva

### Detección de Estabilidad Máxima 🎯
La prueba ahora detecta automáticamente cuándo la conexión alcanza su **velocidad máxima sostenida**:

1. **Descarga**: Un archivo único de **10GB** desde Cloudflare
   - Monitorea velocidad cada 500ms
   - Detecta cuando no mejora en 3 segundos = estabilizada
   - Puede parar temprano si alcanza máximo (ahorra tiempo)

2. **Subida**: Un archivo único de **10GB** hacia servidor
   - Mismo algoritmo de estabilidad
   - Reporta velocidad real máxima sin limitaciones

#### Ventajas:
- ✅ Mide velocidad máxima REAL del WiFi
- ✅ Sin limitaciones de múltiples archivos pequeños
- ✅ Detección automática de plateau
- ✅ Tiempo variable (depende de conexión)

### Cambios Específicos:

| Aspecto | Antes | Después | Efecto |
|---------|-------|---------|--------|
| Download | 3 archivos 100-200MB | 1 archivo 10GB + estabilidad | Mide máximo real |
| Upload | 2 archivos 50-100MB | 1 archivo 10GB + estabilidad | Mide máximo real |
| Detección | Mediana de muestras | Plateau en 3seg | Más preciso |
| Tiempo total | ~15 min | 5-20 min (variable) | Depende de conexión |

### 3. **Servidor Optimizado**
- **Next.js Config**: Aumentado `bodyParser.sizeLimit` de 50MB a 500MB
- **API Endpoint**: Headers `no-cache` agregados para evitar cachés problemáticas
- **Validación**: Mejorada con mejor rango de velocidades esperadas

### 4. **Logging Mejorado**
- Mensajes consolidados: `/1/1` en lugar de `/1/2` y `/2/2`
- Progreso más claro durante uploads
- Timestamps precisos en milisegundos

## Cómo Ejecutar Tests

```bash
# Tests unitarios
npm test

# Test de velocidad completo (10 minutos)
npm test -- --testNamePattern="should perform accurate speed test"
```

## Cómo Funciona la Detección de Estabilidad

```
Tiempo →
Velocidad ↑
        │                    ┌────────────────┐ ← Plateau (estabilizado)
        │                   /                  │
        │                  /  Acelerando      │ ← 3 seg sin mejora = DETENER
        │                 /                    │
        │________________/_____________________|
        
        Fase 1: Acelera    Fase 2: Estabiliza    Fase 3: Parar (resultado)
        (velocidad sube)   (velocidad constante)
```

### Ejemplo Real:
- **0-5 seg**: Velocidad sube 10 → 50 → 90 Mbps
- **5-15 seg**: Velocidad se mantiene 90-92 Mbps (estable)
- **Resultado**: 91 Mbps (valor máximo sostenido)

## Resultados Esperados

### Para conexiones de fibra (100 Mbps real):
- **Download**: ~95 Mbps (velocidad máxima sostenida)
- **Upload**: ~45 Mbps (velocidad máxima sostenida)
- **Tiempo**: 5-8 minutos (parada automática al estabilizar)

### Para WiFi 5GHz (50 Mbps real):
- **Download**: ~48 Mbps
- **Upload**: ~24 Mbps  
- **Tiempo**: 3-5 minutos

### Para WiFi 2.4GHz (20 Mbps real):
- **Download**: ~19 Mbps
- **Upload**: ~12 Mbps
- **Tiempo**: 2-3 minutos

## Validaciones Implementadas

1. ✅ Archivo único de 10GB para medir máximo real
2. ✅ Detección automática de estabilidad (3 seg sin mejora)
3. ✅ Para temprana al alcanzar plateau
4. ✅ Chunks de 5MB para eficiencia en Railway
5. ✅ 2 requests concurrentes para máximo throughput
6. ✅ body parser aumentado a 500MB en Next.js
7. ✅ Monitoreo cada 500ms para precisión
8. ✅ Timeouts largos (180 seg por chunk)

## Implementación Técnica

### Código de Estabilidad
```typescript
// Detecta cuando velocidad se estabiliza (no mejora en 3 seg)
if (speed > lastMaxSpeed) {
    lastMaxSpeed = speed
    lastMaxSpeedTime = now
}

if (now - lastMaxSpeedTime > 3000 && totalUploaded > 1GB) {
    // Parar early - ya alcanzó máximo
    resolve(lastMaxSpeed)
}
```

### Parámetros Configurables
```typescript
stabilityWindow = 3000     // 3 segundos sin mejora = estable
CHUNK_SIZE = 5 * 1024 * 1024  // 5MB chunks
maxConcurrent = 2          // 2 requests al mismo tiempo
timeout = 180000           // 3 minutos por chunk
```

## Troubleshooting

### "Velocidad muy baja (5 Mbps pero conexión es 100 Mbps)"
**Causa**: El WiFi no está optimizado. Intenta:
- Acercarse al router
- Cambiar a 5GHz
- Reiniciar el router

### "Error: Connection timeout"
- Aumentar `timeout` en `uploadToLocalEndpointStable()` 
- Verificar la conexión a Railway

### "Upload se detiene en 1GB"
- Significa que alcanzó estabilidad a ese punto
- Es el valor máximo sostenido de tu conexión
