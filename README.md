# Spapens Outdoor & Snow

Website + webshop + drop-off booking for a ski & snowboard tuning shop in Hilvarenbeek.
Self-hosted, replacing a paid site builder.

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind v4 — dark theme, SSG/ISR, SEO-first (Dutch).
- **Data + admin:** PocketBase (own container) — products, orders, bookings, services, and shop
  settings, all editable in its dashboard. No code needed for the shop owner.
- **Payments:** Mollie (iDEAL) — prices always recomputed server-side.
- **Email:** Resend · **Spam:** honeypot + optional Cloudflare Turnstile.

## Structure
```
web/            Next.js app (Dockerfile, app/, components/, lib/, scripts/)
pocketbase/     PocketBase container: pb_migrations (schema), pb_hooks (revalidation)
docker-compose.yml   web + pocketbase
.env.example    all config (copy to .env)
DEPLOY.md       production setup checklist
```

## Local development
Runs against a local PocketBase binary (or the Docker container).
```bash
# 1. PocketBase (download the binary or `docker compose up pocketbase`), then seed:
cd web && npm install
node scripts/pb-setup.mjs      # schema + example products + slots + settings
node scripts/pb-services.mjs   # services + images
# 2. web/.env.local  → POCKETBASE_URL, NEXT_PUBLIC_POCKETBASE_URL, admin creds, Google keys, REVALIDATE_SECRET
# 3. run Next
npm run dev                    # or: node ./node_modules/next/dist/bin/next dev
```
> Windows note: the folder name contains `&`, which breaks `npm run` via cmd.exe.
> Invoke Next through Node directly (`node ./node_modules/next/dist/bin/next dev`) or use Docker.

## Production
See **[DEPLOY.md](DEPLOY.md)** — DNS, `.env`, `docker compose up`, admin + seed, then Mollie/Resend keys.
