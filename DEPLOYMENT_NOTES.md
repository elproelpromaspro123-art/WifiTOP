# Notas de Deployment - WiFi Speed Test v2

## 📦 Cambios Implementados

### Archivos Modificados:
```
lib/speedtest-improved.ts      (descarga/subida de 10GB + estabilidad)
app/api/upload-test/route.ts   (mejoras en validación y headers)
next.config.js                 (bodyParser: 50MB → 500MB)
__tests__/speedtest.test.ts    (suite consolidada)
```

### Archivos Nuevos:
```
SPEEDTEST_OPTIMIZATION.md      (documentación de optimización)
SPEEDTEST_ARCHITECTURE.md      (diagrama y flujo del algoritmo)
CHANGES_SUMMARY.md             (resumen de cambios)
DEPLOYMENT_NOTES.md            (este archivo)
```

## 🚀 Deployment a Railway

### Paso 1: Verificar cambios localmente
```bash
npm install
npm test -- speedtest.test.ts  # Ejecutar test de velocidad
```

### Paso 2: Push a GitHub
```bash
git add .
git commit -m "feat: WiFi speed test v2 - 10GB files + stability detection"
git push origin main
```

### Paso 3: Railway auto-deploya
- Railway detecta push a main
- Instala dependencias
- Ejecuta build (next build)
- Inicia con `npm start`

### Paso 4: Verificar en producción
```bash
curl https://wifitop-production.up.railway.app/api/health
# Debe responder con status ok
```

## ⚙️ Configuración Railway

### Variables de Entorno (ya configuradas):
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://wifitop-production.up.railway.app
DATABASE_URL=<tu-conexión-postgresql>
```

### Limites a Verificar:
- ✅ Memoria: 512MB (suficiente para 10GB streaming)
- ✅ CPU: Compartido (suficiente)
- ✅ Network: Sin límites
- ✅ Disk: 10GB (suficiente para logs)

## 🔍 Troubleshooting

### Si el test falla con "413 Payload too large":
```javascript
// Ya está solucionado en next.config.js:
api: {
    bodyParser: {
      sizeLimit: '500mb'
    }
}
```

### Si el test es muy lento (>30 min):
- Verificar conexión a Railway
- Aumentar CPU si es necesario
- Reducir `downloadSize` a 2GB temporalmente

### Si el upload falla a mitad:
- Aumentar timeout en `uploadToLocalEndpointStable()`
- Cambiar de `180000` a `300000` (5 minutos)

## 📊 Monitoreo

### Logs en Railway:
```bash
# Ver logs en tiempo real
railway logs

# Filtrar por velocidad test
railway logs | grep "Upload\|Download\|Estabilizado"
```

### Métricas a monitorear:
- Tiempo de respuesta API
- Memoria RAM usada
- Errores de timeout
- Velocidades medidas (trending)

## 🎯 Objetivos de Rendimiento

### Esperado:
- ✅ Download: 80-95 Mbps (si conexión es 100 Mbps)
- ✅ Upload: 40-50 Mbps (si conexión es 100 Mbps)
- ✅ Tiempo: 5-10 minutos por test completo
- ✅ Estabilidad: >80%

### Si no alcanza:
1. Verificar conexión WiFi local
2. Acercarse al router
3. Cambiar a 5GHz si está en 2.4GHz
4. Reiniciar el router

## 📝 Cambios Importantes

### Para Desarrolladores:
1. **Nueva función**: `uploadToLocalEndpointStable()`
   - Parámetro: `stabilityWindow = 3000`
   - Retorna máximo sostenido

2. **Archivos ahora de 10GB**:
   - `downloadSize = 10 * 1024 * 1024 * 1024`
   - `uploadSize = 10 * 1024 * 1024 * 1024`

3. **Lógica de parada temprana**:
   ```typescript
   if (now - lastMaxSpeedTime > stabilityWindow) {
       // Parar - ya alcanzó máximo
       resolve(maxSpeed)
   }
   ```

## 🔄 Rollback (si algo falla)

```bash
# Volver a versión anterior
git revert <commit-hash>
git push origin main

# Railway automáticamente hace redeploy
```

## ✅ Checklist Pre-Deployment

- [ ] Tests locales pasando (`npm test`)
- [ ] No hay errores TypeScript (`npx tsc --noEmit`)
- [ ] Cambios documentados
- [ ] body parser aumentado a 500MB
- [ ] API endpoint validado
- [ ] Tests de estabilidad <20%
- [ ] Documentación actualizada

## 📞 Soporte

### Si algo no funciona:
1. Revisar `SPEEDTEST_ARCHITECTURE.md` para entender el flujo
2. Verificar logs: `railway logs`
3. Ejecutar test local: `npm test -- speedtest.test.ts`
4. Aumentar timeouts si necesario

### Parámetros ajustables (sin redeploy):
```typescript
// En next.config.js:
stabilityWindow: 3000  → cambiar a 4000 o 5000
CHUNK_SIZE: 5MB        → cambiar a 10MB
maxConcurrent: 2       → cambiar a 3 o 4
```

---

**Versión**: 2.0
**Estado**: Listo para producción
**Fecha**: Enero 2025
**Responsable**: Tu nombre
