# Style Guide & Architecture

## Core Principles
- No console.log with emojis in production
- Single source of truth for speedtest (speedtest-ultra-stable.ts)
- Cloudflare Speed API for all measurements

## Project Structure
- `/lib/speedtest-ultra-stable.ts` - Main speedtest engine
- `/components/SpeedTestCardImproved.tsx` - UI component
- `/app/test/page.tsx` - Test page using speedtest-ultra-stable
- All aliases (precision, real, improved) point to simulateSpeedTestStable

## Recent Cleanup (2026-01-04)
- Removed: speedtest-precision.ts, speedtest-real.ts
- Consolidated: All speedtest logic in speedtest-ultra-stable.ts
- Production ready: All console logs and debug code removed
