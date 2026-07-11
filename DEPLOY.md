# Deploy — Spapens Outdoor & Snow

Self-hosted: two Docker containers (`web` = Next.js, `pocketbase` = data + admin) behind
your reverse proxy with Let's Encrypt. Below is everything to fill in for production.

## 0. DNS / Cloudflare
Point two names at the server:
- `waxen-en-slijpen-hilvarenbeek.nl` → the site (`web`, port 3000)
- `beheer.waxen-en-slijpen-hilvarenbeek.nl` → the PocketBase admin (`pocketbase`, port 8090)

(If Cloudflare proxied: enable "Full (strict)" TLS. Certbot on the host issues the certs.)

## 1. Get the code + env
```bash
git clone https://github.com/Flack27/Ski-Snowboard.git
cd Ski-Snowboard
cp .env.example .env
```
Fill in `.env` (this file is git-ignored — never commit it):

| Variable | What to put |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://waxen-en-slijpen-hilvarenbeek.nl` |
| `POCKETBASE_URL` | `http://pocketbase:8090` (internal — leave as-is) |
| `NEXT_PUBLIC_POCKETBASE_URL` | `https://beheer.waxen-en-slijpen-hilvarenbeek.nl` |
| `POCKETBASE_ADMIN_EMAIL` / `_PASSWORD` | a strong admin login (the shop's dashboard) |
| `PB_ENCRYPTION_KEY` | 32 random chars (`openssl rand -hex 16`) |
| `REVALIDATE_SECRET` | any long random string (`openssl rand -hex 24`) |
| `MOLLIE_API_KEY` | Mollie **test_…** first, then **live_…** — *when you have the business account* |
| `RESEND_API_KEY` / `MAIL_FROM` / `MAIL_OWNER` | *when Resend is set up (step 5)* |
| `NEXT_PUBLIC_GOOGLE_PLACE_ID` / `GOOGLE_MAPS_API_KEY` | already known — keep the ones from dev |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | optional (step 6) |

## 2. Bring it up
```bash
docker compose up -d --build
```
This starts both containers and PocketBase auto-applies the schema migrations
(products, orders, bookings, services, settings, time_slots, blocked_dates).

## 3. Create the admin + seed content
```bash
# create the PocketBase superuser (once)
docker compose exec pocketbase /pb/pocketbase admin create "$POCKETBASE_ADMIN_EMAIL" "$POCKETBASE_ADMIN_PASSWORD"
```
Then, from a machine with Node (e.g. your laptop), seed services + booking defaults into prod:
```bash
cd web && npm install
PB_URL=https://beheer.waxen-en-slijpen-hilvarenbeek.nl \
PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... \
node scripts/pb-setup.mjs      # collections check + example products + time slots + settings
PB_URL=... PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... node scripts/pb-services.mjs   # the 4 services + images
```
(Skip `pb-demo-elan.mjs` — that's only demo photos.) After this, your brother manages
everything at **beheer.…/_/** → products, services (text/price/photo), orders, bookings,
time slots, and the shipping toggle. Edits appear on the site within seconds (revalidation hook).

## 4. Mollie (payments)
1. Put `MOLLIE_API_KEY=test_…` in `.env`, `docker compose up -d web`.
2. Do **one test purchase** end-to-end; confirm the order flips to **paid** and stock drops
   (the webhook `https://…/api/mollie-webhook` must be reachable — it is once deployed).
3. Swap to `live_…` and restart `web`. Done.

## 5. Resend (email)
1. Add the domain in Resend → add the **SPF + DKIM DNS records** it gives you.
2. Set `RESEND_API_KEY`, `MAIL_FROM="Spapens Outdoor & Snow <info@waxen-en-slijpen-hilvarenbeek.nl>"`,
   `MAIL_OWNER=info@…`, restart `web`. Contact/booking/order emails now send.

## 6. Hardening (recommended)
- **Google Maps key**: in Cloud Console restrict it to the **Places API** + your server IP,
  and set a low daily quota + a €1 budget alert. (Usage is ~1 call/day.)
- **Turnstile**: create a Cloudflare Turnstile widget, set both keys → upgrades spam
  protection from the honeypot to a full challenge.
- Replace the **Elan demo photos** in the admin with real product photos.

## Updating later
```bash
git pull && docker compose up -d --build
```
Schema changes ship as new migration files and apply automatically. Uploaded photos and data
live in the `pocketbase/pb_data` volume (back this up).
