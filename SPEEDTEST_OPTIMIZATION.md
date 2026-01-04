# WiFi Speed Test - Optimización Railway

## Cambios Realizados

### 1. **Tests Consolidados** ✅
- **Antes**: Múltiples tests en archivos separados (frágil y inconsistente)
- **Después**: Único archivo de test (`__tests__/speedtest.test.ts`) con suite consolidada
- **Beneficio**: Pruebas más confiables y fáciles de mantener

### 2. **Upload Optimizado** 🚀
- **Antes**: Upload limitado a ~20 Mbps (cuello de botella detectado)
- **Después**: Upload sin restricciones (ajustado para Railway)

#### Cambios Específicos en Upload:

| Aspecto | Antes | Después | Efecto |
|---------|-------|---------|--------|
| Tamaño archivo | 50MB + 100MB | 200MB (único) | Menos overhead de pruebas |
| Tamaño chunk | 2MB | 5MB | Menos requests HTTP |
| Delay entre chunks | 50ms | 0ms | Sin esperas innecesarias |
| Requests concurrentes | 1 | 2 | Mejor utilización de ancho de banda |
| Timeout por chunk | 60s | 120s | Más tolerante con Railway |

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

## Resultados Esperados

Con estas optimizaciones en Railway:

### Para conexiones de fibra (90+ Mbps):
- **Download**: 85-95 Mbps
- **Upload**: 40-80 Mbps (NO limitado a 20 Mbps)
- **Ratio Upload/Download**: >25%
- **Variabilidad Upload**: <50%

### Para WiFi de 50 Mbps:
- **Download**: 48-52 Mbps
- **Upload**: 25-45 Mbps
- **Estabilidad**: >80%

## Validaciones Implementadas

1. ✅ Upload sin limitaciones artificiales
2. ✅ Chunks más grandes = menos overhead
3. ✅ Requests concurrentes para máximo throughput
4. ✅ Test único consolidado para precisión
5. ✅ Railway body limits suficientes (500MB)
6. ✅ Timeouts apropiados para operaciones largas

## Próximos Pasos (Opcional)

Si siguen habiendo límites:
1. Aumentar `CHUNK_SIZE` a 10MB en `uploadToLocalEndpoint()`
2. Aumentar `maxConcurrent` a 3-4 requests
3. Verificar limits en Railway (network/CPU)

## Troubleshooting

### Error: "HTTP 413" (Payload too large)
- ✅ **Arreglado**: Subido `next.config.js` a 500MB

### Upload lento (~20 Mbps):
- ✅ **Arreglado**: Removed 50ms delay entre chunks
- ✅ **Arreglado**: Aumentados chunks de 2MB a 5MB
- ✅ **Arreglado**: 2 requests concurrentes habilitados

### "E2E timeout":
- Test consolidado toma ~5-10 minutos
- Timeout configurado a 600 segundos (10 min)
