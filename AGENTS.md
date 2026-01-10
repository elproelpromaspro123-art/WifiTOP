# WifiTOP - Agent Guidelines

## Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`

## Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- PostgreSQL (via `pg`)

## Structure
```
app/          # Pages and API routes
components/   # React components
hooks/        # Custom hooks
lib/          # Core logic (db, speedtest, i18n, validation, badges)
types/        # TypeScript types
```

## Key Features
- Speedtest using Cloudflare CDN
- Global ranking (top 100k)
- Rate limiting (5/min, 20/hour)
- Fraud detection
- Multi-language (en, es, zh, hi, fr)
- Badge system (12 badges)

## Deployment
- Platform: Render
- Database: PostgreSQL (Render)
- Config: render.yaml
