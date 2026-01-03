# ⚡ WifiTOP - Speedtest Ranking Global

Presume tu velocidad de WiFi y compite en el ranking mundial. Premium UI con animaciones impactantes.

## 🚀 Inicio Rápido

```bash
npm install
npm run migrate
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📊 Características

- ⭐ Rating visual 1-10 según velocidad
- 🎮 Casos de uso dinámicos (Gaming, 4K, etc)
- 🏆 Ranking global de top 1000 con animaciones
- 📱 100% Responsive (Desktop, Tablet, Mobile)
- 🎨 Dark-White theme con efecto glow
- ⚡ Animaciones suaves con Framer Motion
- 🔒 Validaciones robustas
- 🌐 SEO optimizado
- 📦 Ready para Vercel

## 🛠️ Deploy en Vercel

1. Push a GitHub (ejecutar `DEPLOY.ps1` o `PUSH.cmd`)
2. Ir a [vercel.com](https://vercel.com)
3. Importar repositorio: `elproelpromaspro123-art/WifiTOP`
4. Agregar variables:
   - `DATABASE_URL=postgresql://...`
   - `NEXT_PUBLIC_SITE_URL=https://[proyecto].vercel.app`
   - `NEXT_PUBLIC_SITE_NAME=WifiTOP`
   - `NODE_ENV=production`
5. Deploy!

## 📚 Stack

- Next.js 14 + React 18
- TypeScript
- Tailwind CSS + Framer Motion
- PostgreSQL
- Serverless (Vercel)

## 📖 API

- `POST /api/speedtest` - Realizar prueba
- `GET /api/ranking` - Top 1000 resultados
- `GET /api/stats` - Estadísticas globales
- `GET /api/health` - Health check
