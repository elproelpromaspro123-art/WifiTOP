# Arquitectura del Speed Test - WiFi a Full

## Visión General

```
┌─────────────────────────────────────────────────────────┐
│         PRUEBA DE VELOCIDAD - 10GB + ESTABILIDAD       │
└─────────────────────────────────────────────────────────┘

FASE 1: PING (2 min)
├─ 20 muestras a servidores Cloudflare
└─ Calcula latencia y jitter real

FASE 2: DESCARGA (variable, 5-15 min)
├─ 1 archivo de 10GB desde Cloudflare
├─ Monitorea velocidad cada 500ms
├─ Detecta máximo en 3 segundos sin mejora
└─ Parada automática al alcanzar plateau

FASE 3: SUBIDA (variable, 3-10 min)
├─ Genera 10GB de datos aleatorios
├─ Sube en chunks de 5MB (2 concurrentes)
├─ Misma lógica de estabilidad
└─ Parada automática al plateau

RESULTADO: Velocidad máxima sostenida en condiciones reales
```

## Algoritmo de Detección

```
Descarga/Subida de 10GB:

Velocidad (Mbps)
│
│  ┌────────────────────→ PLATEAU (estabilizado)
│ /
│/___________________
0        Tiempo (segundos)

Lógica:
1. Cada 500ms: medir velocidad instantánea
2. Si velocidad > máximo anterior: actualizar máximo
3. Si 3 segundos sin mejora: DETENER (alcanzó máximo)
4. Continuar hasta que se estabilice O se descargue todo
```

## Flujo por Tipo de Conexión

### WiFi 5GHz (100 Mbps)
```
[0s]   Iniciando...
[2s]   Acelerando: 20 → 50 → 85 Mbps
[5s]   Acelerando: 85 → 95 Mbps
[8s]   Estable: 95 Mbps ✓ (sin mejora desde segundo 5)
[8s]   DETENER - Máximo: 95 Mbps
└─ Tiempo total: ~8 minutos (1.5GB descargado)
```

### WiFi 2.4GHz (30 Mbps)
```
[0s]   Iniciando...
[3s]   Acelerando: 10 → 20 → 28 Mbps
[6s]   Estable: 28-29 Mbps ✓ (sin mejora desde segundo 3)
[6s]   DETENER - Máximo: 28 Mbps
└─ Tiempo total: ~3 minutos (0.5GB descargado)
```

### Fibra 1Gbps
```
[0s]   Iniciando...
[5s]   Acelerando: 100 → 300 → 600 Mbps
[10s]  Acelerando: 600 → 900 Mbps
[15s]  Estable: 950 Mbps ✓ (sin mejora desde segundo 12)
[15s]  DETENER - Máximo: 950 Mbps
└─ Tiempo total: ~15 minutos (3GB descargado)
```

## Componentes

### Cliente (`lib/speedtest-improved.ts`)
```
measurePingAccurate()
├─ 20 requests a Cloudflare
└─ Calcula promedio + rango

measureDownloadReal()
├─ fetch() de 10GB con streaming
├─ Monitorea velocity cada 500ms
├─ Detecta plateau automáticamente
└─ Retorna: maxSpeed, samples[], tiempo total

measureUploadReal()
├─ Genera 10GB de datos
├─ uploadToLocalEndpointStable() con chunks
├─ Mismo algoritmo de estabilidad
└─ Retorna: maxSpeed, samples[], tiempo total
```

### Servidor (`app/api/upload-test/route.ts`)
```
POST /api/upload-test
├─ Recibe chunks de 5MB
├─ Mide duración real
├─ Retorna velocidad del chunk
└─ Next.js: bodyParser 500MB (Railway)
```

### UI
```
Barra de progreso:
├─ 0-10%:  Ping (2 min)
├─ 10-70%: Descarga (variable)
├─ 71-96%: Subida (variable)
└─ 97-100%: Procesamiento

Estado en tiempo real:
└─ "⬇️ Descarga: 2.5GB / 10GB | 85.5 Mbps (✓ Estabilizado)"
```

## Parámetros Ajustables

### Para conexiones lentas (<20 Mbps)
```typescript
// Reducir archivo si es necesario
downloadSize = 2 * 1024 * 1024 * 1024  // 2GB en lugar de 10GB

// Aumentar ventana de estabilidad (más espera)
stabilityWindow = 5000  // 5 segundos en lugar de 3
```

### Para conexiones rápidas (>200 Mbps)
```typescript
// Aumentar chunks para menos overhead
CHUNK_SIZE = 10 * 1024 * 1024  // 10MB en lugar de 5MB

// Más requests concurrentes
maxConcurrent = 4  // 4 en lugar de 2
```

### Para Railway con límites
```typescript
// Ya configurado:
bodyParser.sizeLimit = '500mb'
timeout = 180000  // 3 min por chunk
CHUNK_SIZE = 5 * 1024 * 1024  // 5MB (óptimo)
```

## Ventajas del Diseño

✅ **Precisión**: Mide velocidad máxima real, no promedio
✅ **Eficiencia**: Para automáticamente al alcanzar máximo
✅ **Adaptable**: Tiempo variable según conexión (no esperas fijas)
✅ **Robusto**: Chunks + retry logic + timeouts
✅ **Transparente**: Reporta progreso en tiempo real
✅ **Sin Límites**: 10GB descarga + 10GB subida si es necesario

## Flujo Completo

```
Usuario inicia test
    ↓
[PING] 20 muestras → latencia + jitter
    ↓
[DOWNLOAD] 10GB con estabilidad → maxDown, minDown
    ↓
[UPLOAD] 10GB con estabilidad → maxUp, minUp
    ↓
Calcula:
  - Estabilidad general
  - Jitter real
  - Variabilidad
    ↓
Muestra resultados
```

## Ejemplo de Resultado Real

```json
{
  "downloadSpeed": 92.45,
  "uploadSpeed": 47.23,
  "ping": 18.5,
  "jitter": 2.3,
  "minDownload": 85.10,
  "maxDownload": 94.20,
  "minUpload": 43.50,
  "maxUpload": 49.10,
  "stability": 87.5,
  "downloadSamples": [92, 93, 92, 94, 93, 92, 91],
  "uploadSamples": [48, 48, 47, 47, 46, 45],
  "timestamp": "2025-01-04T15:30:00Z"
}
```

**Interpretación**:
- Download alcanzó **94.2 Mbps** de máximo
- Upload alcanzó **49.1 Mbps** de máximo
- Ambos se estabilizaron en ~3 segundos sin mejora
- Conexión muy estable (87.5% de estabilidad)
