# Style Guide & Architecture

## Core Principles
- ✅ No console.log in production (all removed)
- Single source of truth for speedtest (speedtest-ultra-stable.ts)
- Cloudflare Speed API for all measurements
- TypeScript strict mode enabled
- Security headers configured in middleware
- Rate limiting: 5 requests/minute, 20 requests/hour

## Project Structure
- `/lib/speedtest-ultra-stable.ts` - Main speedtest engine (production ready, no console logs)
- `/lib/db.ts` - Database abstraction layer (cleaned)
- `/lib/rate-limit.ts` - Rate limiting logic (cleaned)
- `/components/SpeedTestCardImproved.tsx` - UI component (optimized)
- `/app/api/speedtest/route.ts` - Main API endpoint (security improved)
- All translation keys in `/lib/i18n.ts` (5 languages: en, es, zh, hi, fr)

## Recent Cleanup (2026-01-05)
✅ Completed:
- Removed ALL console.log/console.error from production code
  - speedtest-ultra-stable.ts: 11 console calls removed
  - db.ts: query logging removed
  - rate-limit.ts: error logging removed
  - speedtest route: anomaly detection logging removed
- Improved metadata in layout.tsx (removed emojis from SEO)
- Enhanced name validation in speedtest route
- Optimized component rendering
- Added error boundaries and proper error handling

## Environment Variables
- DATABASE_URL: PostgreSQL connection string (required)
- NEXT_PUBLIC_SITE_URL: Public site URL
- NEXT_PUBLIC_SITE_NAME: Site name (default: WifiTOP)
- NODE_ENV: development | production

## Security
- Middleware: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- Name validation: 2-30 chars, alphanumeric + accents
- Anomaly detection: 12 fraud detection flags
- Rate limiting: Per-IP minute and hour limits
