# 🎯 Mejoras Recomendadas para WifiTOP

## 🔴 CRÍTICAS (Hacer primero)

### 1. Seguridad: Credenciales Expuestas
**Archivo:** `.env.example`
**Problema:** Contiene credenciales reales de base de datos
**Solución:**
```bash
# Cambiar credenciales en producción
# Eliminar credenciales reales del .env.example
# Usar variables aleatorias en el ejemplo
```

### 2. Deduplicar Tipos
**Archivos:** `lib/speedtest.ts` y `types/index.ts`
**Problema:** `SpeedTestResult` está definido en dos lugares
**Solución:** Eliminar la definición de `lib/speedtest.ts`, importar desde `types/index.ts`

### 3. Rate Limiting en Persistencia
**Archivo:** `app/api/speedtest/route.ts` (líneas 7-21)
**Problema:** Se pierde al reiniciar el servidor, puede ser burlado
**Solución:** Almacenar en PostgreSQL o usar Redis

---

## 🟠 ALTAS (Hacer después)

### 4. Optimizar Queries de Ranking
**Archivo:** `lib/ranking.ts`
**Problema:** `maintainRanking()` hace 3 queries cuando se pueden hacer 1
**Ejemplo de mejora:**
```sql
-- En lugar de 3 queries separadas:
DELETE FROM results
WHERE download_speed < (
  SELECT COALESCE(
    (SELECT download_speed 
     FROM results 
     ORDER BY download_speed DESC 
     LIMIT 1 OFFSET 999),
    0
  )
)
AND id NOT IN (
  SELECT id FROM results
  ORDER BY download_speed DESC
  LIMIT 1000
);
```

### 5. Validación Moderna en UI
**Archivo:** `components/SpeedTestCard.tsx` (línea 46)
**Problema:** Usa `alert()` en 2024
**Solución:** Crear componente `<ValidationError>` reutilizable

### 6. Manejo de Errores en Hooks
**Archivos:** `hooks/useStats.ts`, `hooks/useRanking.ts`
**Problema:** Capturan errores pero UI no los muestra
**Solución:** Mostrar toast/banner cuando hay errores

---

## 🟡 MEDIAS (Mejoras UX)

### 7. Variabilidad Realista del Speedtest
**Archivo:** `lib/speedtest.ts`
**Problema:** Simulación muy predecible
**Solución:** 
- Agregar jitter más realista
- Considerar patrones de uso (horarios pico)
- Añadir latencia variable

### 8. Paginación en Ranking
**Archivo:** `components/RankingTable.tsx`
**Problema:** Carga todos los 1000 resultados (performance)
**Solución:** Implementar virtualization con `react-window` o paginación

### 9. API Geolocalización
**Archivo:** `lib/speedtest.ts` (líneas 45-57)
**Problema:** Devuelve datos genéricos
**Solución:** Integrar con `ip-api.com` o `maxmind` real

### 10. Búsqueda en Ranking
**Archivo:** `components/RankingTable.tsx`
**Problema:** No hay forma de buscar usuario por nombre
**Solución:** Agregar input de búsqueda con debounce

---

## 🟢 BAJAS (Pulido)

### 11. ESLint y Prettier
**Problema:** No hay linter configurado
**Solución:** Agregar en `package.json`:
```json
"lint": "eslint . --ext .ts,.tsx",
"format": "prettier --write ."
```

### 12. Tests
**Problema:** Sin tests automatizados
**Sugerencia:** Agregar con Vitest/Jest para funciones críticas

### 13. Logging Centralizado
**Problema:** `console.log` dispersos sin estructura
**Solución:** Crear servicio de logger simple

### 14. Dark Mode Toggle
**Problema:** Solo tiene tema oscuro
**Sugerencia:** Agregar tema claro opcional

---

## 📊 Matriz de Impacto vs Esfuerzo

| Mejora | Impacto | Esfuerzo | Prioridad |
|--------|---------|----------|-----------|
| 1. Seguridad credenciales | 🔴🔴🔴 | ⚡ | AHORA |
| 2. Deduplicar tipos | 🟢🟢 | ⚡ | AHORA |
| 3. Rate limiting BD | 🟠🟠🟠 | 🕐 | Semana 1 |
| 4. Optimizar queries | 🟡🟡 | ⚡ | Semana 1 |
| 5. Validación UI | 🟡🟡 | 🕐 | Semana 1 |
| 6. Errores en hooks | 🟡🟡 | 🕐 | Semana 1 |
| 7. Geolocalización real | 🟠🟠 | 🕐🕐 | Semana 2 |
| 8. Paginación ranking | 🟠🟠 | 🕐🕐 | Semana 2 |
| 9. Búsqueda ranking | 🟡🟡 | 🕐 | Semana 2 |
| 10. ESLint/Prettier | 🟢 | ⚡ | Semana 3 |

---

## 🚀 Plan de Acción

### Fase 1: Seguridad (Hoy)
- [ ] Cambiar credenciales en producción
- [ ] Reemplazar `.env.example` con valores placeholder
- [ ] Auditar otros archivos por credenciales hardcodeadas

### Fase 2: Arquitectura (Esta semana)
- [ ] Deduplicar tipos
- [ ] Consolidar queries SQL
- [ ] Mejorar manejo de errores

### Fase 3: UX (Próxima semana)
- [ ] Validación moderna
- [ ] Geolocalización real
- [ ] Búsqueda y paginación

### Fase 4: QA (Después)
- [ ] ESLint + Prettier
- [ ] Tests unitarios
- [ ] Logging centralizado
