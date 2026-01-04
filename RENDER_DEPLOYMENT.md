# Deployment en Render

## Requisitos

1. Cuenta en [Render.com](https://render.com)
2. GitHub conectado a Render
3. Repositorio sincronizado

## Pasos de Deployment

### 1. Usar Blueprint (RECOMENDADO)

1. Ve a tu dashboard en [Render](https://dashboard.render.com)
2. Click en "Blueprints" → "New Blueprint"
3. Conecta tu GitHub y selecciona el repositorio
4. Render automáticamente detectará `render.yaml`
5. Click "Create Blueprint"

**IMPORTANTE**: El blueprint automáticamente:
- Crea una base de datos PostgreSQL
- Configura las variables de entorno
- Conecta la web app a la base de datos

### 2. Inicializar Base de Datos

Después del primer deploy:

1. Ve a tu servicio en Render
2. En la URL, visita: `https://tu-app.onrender.com/api/init`
3. Deberías ver: `{"success":true,"message":"Database initialized"}`

Si ves error 401, necesitas el INIT_TOKEN:
- Ve a "Environment" en tu servicio
- Copia el valor de `INIT_TOKEN`
- Visita: `https://tu-app.onrender.com/api/init?token=TU_TOKEN`

### 3. Verificación

El sitio debe cargarse con:
- ✅ Página principal visible
- ✅ Rankings cargando (sin errores 500)
- ✅ Estadísticas visibles
- ✅ Tests de velocidad funcionando

## Configuración en render.yaml

El archivo `render.yaml` contiene:

```yaml
- PostgreSQL automática (free tier)
- Node.js web service (free tier)
- Variables de entorno automáticas
- INIT_TOKEN generado automáticamente
- DATABASE_URL conectada automáticamente
```

No necesitas configurar nada manualmente si usas el blueprint.

## Variables de Entorno

| Variable | Valor | Auto? |
|----------|-------|-------|
| `NODE_ENV` | production | ✅ |
| `NEXT_PUBLIC_SITE_NAME` | WifiTOP | ✅ |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio | ✅ |
| `DATABASE_URL` | Conexión PostgreSQL | ✅ |
| `INIT_TOKEN` | Token seguro | ✅ |

## Troubleshooting

### Error "ECONNREFUSED" en /api/ranking o /api/stats

**Causa**: Base de datos no inicializada

**Solución**:
1. Espera 2-3 minutos después del deploy
2. Visita `/api/init?token=TU_TOKEN`
3. Recarga el sitio

### Error 502 Bad Gateway

**Causa**: El servicio está crasheando

**Solución**:
1. Ve a "Logs" en Render
2. Busca el error específico
3. Si ves "cannot connect to database", ejecuta `/api/init`

### Sitio muy lento en primer load

**Normal**: Render free tier usa recursos compartidos
- El primer request puede tardar 10-30 segundos
- Requests posteriores son más rápidos

## Comandos útiles locales

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Lint
npm run lint
```

## Límites Free Tier de Render

- **Web**: 0.5 CPU, 512 MB RAM, 750 horas/mes
- **PostgreSQL**: 256 MB storage, sin backups automáticos
- **Inactividad**: Servicio se pausa después de 15 min sin uso

## Dashboard URLs

- Dashboard: https://dashboard.render.com
- Logs: https://dashboard.render.com/services
- Bases de datos: https://dashboard.render.com/postgres

## FAQ

**P: ¿Por qué tarda en cargar la primera vez?**
R: Render free tier usa recursos compartidos. Es normal.

**P: ¿Se pierden los datos si reinicia?**
R: No, la base de datos PostgreSQL persiste los datos.

**P: ¿Puedo usar mi dominio?**
R: Sí, en "Environment" → "Custom Domain"
