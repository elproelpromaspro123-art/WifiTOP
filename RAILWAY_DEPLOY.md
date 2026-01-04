# Deployment a Railway

## Pasos para desplegar en Railway

### 1. Registrarse en Railway
- Ve a https://railway.app
- Crea una cuenta (puedes usar GitHub)
- Verifica tu cuenta

### 2. Instalar Railway CLI (opcional pero recomendado)
```bash
npm i -g @railway/cli
```

### 3. Desplegar desde GitHub

**Opción A: Via Web Dashboard (más fácil)**
1. En [railway.app](https://railway.app), click "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio GitHub: `github.com/elproelpromaspro123-art/WifiTOP`
4. Selecciona la rama `main`
5. Railway detectará automáticamente `package.json` y desplegará

**Opción B: Via CLI**
```bash
# En la carpeta del proyecto
railway link
railway up
```

### 4. Configurar Variables de Entorno

En Railway Dashboard:
1. Ve a tu proyecto
2. Click en "Variables"
3. Agrega:

```
DATABASE_URL=tu_database_url
NEXT_PUBLIC_SITE_URL=https://tu-railway-url.railway.app
SPEEDTEST_PORT=3001
```

### 5. Cambiar plan de instancia

Railway Free ($7/mes) debería ser suficiente. Si necesitas más:
- Ve a "Settings" → "Usage"
- Upgrade si es necesario

### 6. Health Check

Una vez desplegado:
- Frontend Next.js en: `https://tu-railway-url.railway.app`
- Speedtest API en: `https://tu-railway-url.railway.app:3001/health`

## ¿Qué pasa después del deploy?

- ✅ Frontend Next.js corre en puerto 3000
- ✅ Servidor speedtest corre en puerto 3001 (internal)
- ✅ Sin timeout de Vercel
- ✅ Upload test real (50-100MB)
- ✅ Instancia siempre activa (no duerme)

## Costos

- **Free Plan**: $7 USD/mes (suficiente para speedtest)
- **Pro Plan**: $12/mes (si necesitas más recursos)

## Ventajas sobre Vercel

| Feature | Vercel | Railway |
|---------|--------|---------|
| Timeout | 30s ❌ | ∞ ✅ |
| Upload size | 4.5MB ❌ | Ilimitado ✅ |
| Costo | $20+/mes | $7/mes ✅ |
| Instancia siempre activa | Sí ✅ | Sí ✅ |

## Troubleshooting

**Problema: Railway no encuentra dependencies**
- Railway usa `nixpacks` automáticamente
- Instala Node.js: `nixpacks` se encarga

**Problema: Speedtest API da 404**
- Verifica que el server.js esté corriendo
- Logs: En Railway Dashboard → "Logs"

**Problema: Base de datos no conecta**
- Asegúrate que `DATABASE_URL` esté configurada
- La URL debe ser accesible desde Railway

## Migración desde Vercel

Pasos:
1. Deploy en Railway (arriba)
2. Cambia DNS en tu dominio a Railway
3. Configura HTTPS automático (Railway incluido)
4. Verifica que todo funcione
5. Cancela Vercel

¡Listo! 🚀
