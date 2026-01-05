# AGENTS.md

## Normas Obligatorias

### NO crear archivos innecesarios
- **Prohibido**: Crear archivos de documentación (.md) - EXCEPTO cuando son críticos
- Solo crear archivos estrictamente necesarios para la funcionalidad

---

## Cambios Realizados (2026-01-04)

### ✅ Fix Ultra-Estable: Speedtest Completo

**Problema**: 
- Crypto.getRandomValues overflow (máximo 65536 bytes)
- Ping 250ms (debería 8-15ms)
- Descarga 77 Mbps (debería 95-100)
- Upload fallaba

**Solución**:
- `lib/speedtest-ultra-stable.ts` - Motor ultra-estable
  - Ping: Cloudflare + Google DNS
  - Descarga: Auto-parada cuando estable
  - Upload: Crypto en chunks de 64KB máximo (ARREGLADO)
  - Estadísticas: IQR robusto

**Cambios**:
- ✅ lib/speedtest-ultra-stable.ts (NUEVO)
- ✅ components/SpeedTestCardImproved.tsx (importa de ultra-stable)
- ✅ AGENTS.md (registro)

**Resultado**:
- ✅ Sin errores de crypto
- ✅ Upload funcional
- ✅ Todos los tests corren
