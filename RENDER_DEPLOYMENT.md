# Deployment en Render

## Requisitos

1. Cuenta en [Render.com](https://render.com)
2. GitHub conectado a Render
3. Variables de entorno configuradas

## Pasos de Deployment

### 1. Crear Blueprint en Render

1. Ve a tu dashboard en [Render](https://dashboard.render.com)
2. Click en "Blueprints"
3. Click en "New Blueprint"
4. Selecciona tu repositorio de GitHub
5. Render automáticamente detectará el archivo `render.yaml`

### 2. Configurar Variables de Entorno

En Render, establece:

- `DATABASE_URL`: Conexión PostgreSQL (se genera automáticamente si usas Render Postgres)
- `NEXT_PUBLIC_SITE_URL`: URL de tu dominio (ej: https://yourdomain.onrender.com)
- `NEXT_PUBLIC_SITE_NAME`: WifiTOP (ya está en render.yaml)
- `NODE_ENV`: production (ya está en render.yaml)

### 3. Deploy

1. El deployment se inicia automáticamente
2. Render ejecutará:
   ```bash
   npm install && npm run build
   ```
3. Luego iniciará con:
   ```bash
   npm run start
   ```

## Notas Importantes

- El archivo `render.yaml` contiene toda la configuración del deployment
- La base de datos PostgreSQL se crea automáticamente si usas el blueprint
- Los archivos innecesarios han sido eliminados para reducir tiempo de deploy
- El build ocurre en el servidor de Render (Node.js 22.16.0)

## Troubleshooting

### Error de módulos no encontrados

Si ves errores como "Module not found: Can't resolve '@/components/...'":

1. Verifica que los componentes existan en la carpeta `components/`
2. Asegúrate de que el casing (mayúsculas/minúsculas) sea correcto
3. Ejecuta `npm run build` localmente para verificar

### Error de base de datos

1. Verifica que `DATABASE_URL` esté configurada correctamente
2. Asegúrate de que la base de datos esté disponible antes de iniciar

## Comandos útiles

```bash
# Build local
npm run build

# Start production local
npm run start

# Dev local
npm run dev
```
