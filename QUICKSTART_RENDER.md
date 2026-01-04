# 🚀 Inicio Rápido - Deploy en Render

## 3 pasos para tener WifiTOP en vivo

### Paso 1: Crear Blueprint en Render (2 minutos)

```
1. Ve a https://dashboard.render.com
2. Click en "Blueprints" → "New Blueprint"
3. Selecciona tu repositorio: WifiTOP
4. Click "Create Blueprint"
5. Espera a que termine el deploy (≈5 minutos)
```

**Estado del deploy**: Puedes verlo en la pestaña "Logs"

### Paso 2: Inicializar Base de Datos (30 segundos)

Una vez que el deploy esté listo:

```
1. Abre tu servicio en Render
2. Ve a "Environment"
3. Copia el valor de INIT_TOKEN
4. En otra pestaña, visita:
   https://tu-app.onrender.com/api/init?token=PEGA_TOKEN_AQUI
5. Deberías ver: {"success":true,"message":"Database initialized"}
```

### Paso 3: ¡Abre tu app! (0 segundos)

```
https://tu-app.onrender.com
```

## Verificación Rápida

✅ **Si ves**:
- Página principal con "Prueba tu WiFi"
- Rankings y estadísticas
- Botón de comenzar test

✅ **Listo para usar**

❌ **Si ves errores 500 o 502**:
- Espera 2-3 minutos más
- Repite el Paso 2 (inicializar BD)
- Recarga la página

## Problemas Comunes

| Problema | Solución |
|----------|----------|
| Errores en /api/ranking | Ejecutar `/api/init?token=TOKEN` |
| Error 401 en /api/init | Usar el INIT_TOKEN correcto del Environment |
| Sitio lento | Normal en Render free tier (≤30s primer load) |
| Error 502 | Ver logs y ejecutar `/api/init` de nuevo |

## URLs Útiles

- **App**: https://tu-app.onrender.com
- **Logs**: https://dashboard.render.com → Selecciona tu servicio → Logs
- **Environment**: https://dashboard.render.com → Selecciona tu servicio → Environment
- **Base de datos**: https://dashboard.render.com → PostgreSQL
