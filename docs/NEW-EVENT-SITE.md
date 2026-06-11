# 🎉 New Event Site — Setup Runbook

A step-by-step guide to spin up a new quinceañera/event site from this codebase.
Each event is its **own Git branch**, its **own MongoDB database**, its **own Vercel
project**, and its **own subdomain** — but they all **share one repo** and **one R2
bucket**.

> **Worked example used throughout:** Ciarah Hernandez, August 2026.
> Substitute your own event's values where you see the Ciarah examples.

---

## 0. Naming conventions (decide these first)

Pick the names **once** and stay consistent — several systems reference them.

| Thing | Pattern | Ciarah example | Where it's used |
|---|---|---|---|
| **Subdomain** | `name-year.tukio.site` | `ciarahh2026.tukio.site` | Vercel domain (public URL) |
| **Git branch** | `firstname-lastname` | `ciarah-hernandez` | the branch this event lives on |
| **`EVENT.id`** | `first_quince_year` | `ciarah_quince_2026` | DB row scoping (`config.ts`) |
| **`storagePrefix`** | `first-last-quince-yy` | `ciarah-hernandez-quince-26` | R2 folder (`config.ts`) |
| **MongoDB database** | `year-first-last` | `2026-ciarah-hernandez` | connection string |
| **Vercel project** | `first-quince` | `ciarah-quince` | the deploy project |

> Subdomains are case-insensitive, so `CiarahH2026` and `ciarahh2026` are the same.

---

## 1. Branch + config

The whole site is driven by **one config object**: [`config/config.ts`](../config/config.ts).

1. Branch off the template (`main`):
   ```bash
   git checkout main && git pull
   git checkout -b ciarah-hernandez
   ```
2. Edit `config/config.ts` — fill in every field for the event:
   - `id` — e.g. `"ciarah_quince_2026"` (⚠️ **must be unique** — this scopes DB rows)
   - `storagePrefix` — e.g. `"ciarah-hernandez-quince-26"` (the R2 folder)
   - `name`, `fullTitle`
   - `date`, `endTime`, `rsvpBy` (ISO datetimes, local time)
   - `locations.ceremony` (Misa) + `locations.reception` (each: `label`, `icon`, `time`, `venue`)
     - `icon` values map to components in `EventInfo.tsx` (`"church"`, `"pin"`, …)
   - `theme` colors, `music` (`""` = no song), `heroPhoto`/`heroPhotoMobile` (`null` = themed)
   - `padrinos`, `damas`, `chambelanes` (empty `[]` to hide)
   - `dresscode`, `registry` / `giftNote` / `giftNoteEn`, `herGallery`
3. Drop hero/gallery images into [`public/photos/`](../public/photos/) and point the config paths at them.
4. Commit on the branch.

---

## 2. MongoDB — new database (same cluster)

Each event gets its **own database** inside the shared cluster. This keeps
data **and logins** fully isolated (logins are **not** event-scoped in code, so separate
DBs are what keeps them apart).

1. **MongoDB Atlas** → your cluster. You don't need to pre-create the DB —
   Mongo creates it on first write. (Optionally create it in Compass.)
2. Build the connection string — same cluster/user, **new database name** in the path:
   ```
   mongodb+srv://<db_user>:<password>@<cluster>.xxxxx.mongodb.net/2026-ciarah-hernandez?appName=<cluster>
   ```
   - Change only the **database segment** (`/2026-ciarah-hernandez`).
   - URL-encode special characters in the password (`@`→`%40`, etc.).
3. **Atlas → Network Access:** ensure `0.0.0.0/0` (allow anywhere) is present so Vercel
   can connect.

> **Why a new DB, not a shared one?** RSVPs/photos are namespaced by `EVENT.id`, but the
> `user` collection has **no** event field and the dashboard only checks "is logged in" —
> so a shared DB would let one event's login open another's dashboard. Separate DB =
> clean isolation + you can reuse usernames like `admin`.

---

## 3. Cloudflare R2 — storage

**Reuse the same bucket** (`quince-uploads`). Uploads are namespaced by `storagePrefix`,
so events never collide:

```
quince-uploads/ciarah-hernandez-quince-26/guest-gallery/…   ← guest (QR) uploads
quince-uploads/ciarah-hernandez-quince-26/her-gallery/…     ← admin uploads
```

You usually **don't create a new bucket** — just reuse the R2 credentials. The only
must-dos:

1. **Public Access must be ON** for the bucket:
   Cloudflare → **R2** → `quince-uploads` → **Settings** → **Public Development URL** →
   **Enable**. This gives the `https://pub-xxxxxxxx.r2.dev` URL.
2. Note the **public URL** — you'll set `R2_PUBLIC_URL` to it (see §4). It must be the
   `pub-….r2.dev` domain, **not** the `…r2.cloudflarestorage.com` S3 endpoint (that one
   is private and returns 401).
3. CORS is already wildcarded (`AllowedOrigins: ["*"]`), so new domains work without
   changes. (If you ever make a fresh bucket, run `npm run r2:cors` once.)

> If you want fully separate storage per event instead: create a new bucket, change
> `R2_BUCKET` in `config.ts` **and** `R2_BUCKET_NAME` in env, update `R2_PUBLIC_URL`/
> `R2_PUBLIC_HOSTNAME`, then `npm run r2:cors`.

---

## 4. Environment variables + seed users

### 4a. Create `.env.local`

⚠️ **It must be `.env.local`, not `.env`** — the seed script reads `.env.local`
specifically. Copy `.env.example` and fill it in:

```bash
cp .env.example .env.local
```

Required keys:

| Key | Notes |
|---|---|
| `MONGODB_URI` | the new DB connection string from §2 |
| `BETTER_AUTH_SECRET` | generate fresh: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | the site's URL (`http://localhost:3000` locally; the subdomain in prod) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | same R2 creds as other events |
| `R2_BUCKET_NAME` | `quince-uploads` |
| `R2_PUBLIC_URL` | `https://pub-xxxx.r2.dev` (the public URL from §3) |
| `R2_PUBLIC_HOSTNAME` | `pub-xxxx.r2.dev` (host only — whitelisted by `next.config.ts`) |
| `NEXT_PUBLIC_SITE_URL` | the subdomain, e.g. `https://ciarahh2026.tukio.site` |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` | full-access dashboard login |
| `VIEWER_USERNAME`, `VIEWER_PASSWORD`, `VIEWER_EMAIL` | view-only login (**required** or seed errors) |

### 4b. Seed the logins

```bash
npm run seed
```
Creates the admin + viewer users **in this event's database**. Re-running is safe
(existing users are skipped). Usernames are unique *within the DB*, so `admin` is fine
since each event has its own database.

---

## 5. Vercel — new project (same repo)

Use **one Vercel project per event**, each with its **Production Branch** set to the
event's branch. This makes it a public Production deployment (no preview auth wall) with
isolated env vars.

1. Vercel → **Add New… → Project** → import **this same GitHub repo**.
2. Name it (e.g. `ciarah-quince`).
3. **Settings → Git → Production Branch** → set to `ciarah-hernandez`.
4. **Settings → Environment Variables** → add **all** the keys from §4a to the
   **Production** environment. Set:
   - `BETTER_AUTH_URL` = `https://ciarahh2026.tukio.site`
   - `NEXT_PUBLIC_SITE_URL` = `https://ciarahh2026.tukio.site`
5. **Deploy** (push the branch or trigger a deploy).

> Repeat per event. Same repo, multiple projects — code is shared; each merge of a fix
> into `main` must be merged into the event branch to reach that site.

---

## 6. Subdomain — `name-year.tukio.site`

1. In the **event's Vercel project** → **Settings → Domains → Add Domain**.
2. Enter `ciarahh2026.tukio.site` → **Add**.
3. Vercel shows the DNS record. For a subdomain it's a **CNAME**:
   ```
   Type:  CNAME
   Name:  ciarahh2026
   Value: cname.vercel-dns.com
   ```
4. Add that record where **`tukio.site`** DNS is managed:
   - **Nameservers on Vercel** → added automatically, nothing to do.
   - **Cloudflare / registrar** → add the CNAME manually.
     - ⚠️ **Cloudflare:** set the record to **"DNS only"** (gray cloud), not proxied —
       proxying fights Vercel's SSL and causes redirect/cert loops.
5. Wait a few minutes for verification + auto SSL → `https://ciarahh2026.tukio.site` is live.

---

## 7. QR code + finalize

The guest-upload QR is built from `NEXT_PUBLIC_SITE_URL`, so regenerate it **after** the
domain is set:

```bash
# with NEXT_PUBLIC_SITE_URL=https://ciarahh2026.tukio.site in .env.local
npm run generate-qr
```
This rewrites [`public/qr-upload.png`](../public/qr-upload.png) to point at **this** event's
`/upload` page. Commit it on the branch and redeploy.

---

## 8. Launch checklist ✅

Test on the live subdomain (or `npm run dev` locally first):

- [ ] Envelope intro shows on first visit, centered, opens cleanly
- [ ] Hero photo (or themed bg) loads — no broken image
- [ ] Countdown, date, and both venue cards (Misa + Recepción) show correct times/maps
- [ ] "Cómo llegar" opens directions to the right venue
- [ ] **RSVP** submit → appears in the dashboard
- [ ] **Update RSVP** lookup works
- [ ] Dress code / gifts (`Lluvia de sobres` etc.) render correctly
- [ ] **Guest upload** via QR → photo lands in `…/guest-gallery/` and **displays** in the gallery
- [ ] Dashboard login works (admin **and** viewer)
- [ ] Admin "her gallery" upload → lands in `…/her-gallery/`
- [ ] `og:` preview (title/description) looks right when the link is shared

---

## Common gotchas (learned the hard way)

| Symptom | Cause | Fix |
|---|---|---|
| `next/image` "hostname not configured" | `R2_PUBLIC_URL` set to the `…cloudflarestorage.com` S3 endpoint | use the `pub-….r2.dev` public URL |
| Image shows but **401 / "enable Public access"** | bucket public access is **off** | enable Public Development URL in R2 settings |
| Broken image but server returns 200 | stale browser cache | hard refresh (Cmd+Shift+R) |
| Gallery shows a broken photo though R2 is empty | orphaned **MongoDB** record (gallery lists from Mongo, not R2) | delete the stale doc in the `photos` collection |
| `seed` says "MONGODB_URI not found" | vars are in `.env`, not **`.env.local`** | put them in `.env.local` |
| Dashboard login from another event works | shared DB (logins aren't event-scoped) | use a **separate database** per event |
| Empty `<audio src="">` console error | `music: ""` | already handled (player renders nothing); leave `music: ""` |

---

## Quick reference — the 4 places each name lives

```
EVENT.id        = ciarah_quince_2026          → MongoDB row scoping
storagePrefix   = ciarah-hernandez-quince-26  → R2 folder
database name   = 2026-ciarah-hernandez       → MONGODB_URI path
subdomain       = ciarahh2026.tukio.site      → Vercel domain
git branch      = ciarah-hernandez            → Vercel production branch
```
