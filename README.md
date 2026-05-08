# Quince Invite

A custom Quinceañera event website built with Next.js. Includes an animated invitation intro, RSVP system, admin dashboard, guest photo uploads to Cloudflare R2, and a countdown to the event date — all driven by a single config file so it can be reused for any event.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI, Tailwind Animate |
| Animation | GSAP 3 + ScrollTrigger, @gsap/react |
| Database | MongoDB Atlas via Mongoose |
| Auth | Better Auth |
| File Storage | Cloudflare R2 (S3-compatible) |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Notifications | Sonner |
| Testing | Vitest (unit), Playwright (e2e) |

---

## Features

- **Envelope intro animation** — 3D wax-seal opening on first visit (localStorage gated, auto-disabled on event day)
- **Hero section** — Full-screen photo with parallax scroll and GSAP sparkle field
- **Countdown timer** — Live countdown to the event date
- **RSVP form** — Validated with Zod, stored in MongoDB
- **Guest photo uploads** — Browser uploads directly to Cloudflare R2 via presigned URLs; accessible by QR code
- **Message wall** — Public comments from guests
- **Admin dashboard** — RSVP list, headcount, photo moderation, message management
- **QR code generator** — Generates a printable QR code pointing to the upload page
- **Role-based auth** — Admin and viewer roles via Better Auth

---

## Project Structure

```
app/
  page.tsx                  # Home page (Server Component)
  layout.tsx                # Root layout
  globals.css               # Global styles + scrollbar hide
  api/
    auth/[...all]/          # Better Auth catch-all handler
    rsvp/[id]/              # RSVP submission endpoint
    dashboard/
      rsvps/[id]/           # RSVP management (admin)
      photos/[id]/          # Photo management (admin)
      messages/[id]/        # Message management (admin)

components/                 # All React UI components
config/
  alexa.ts                  # Event configuration (edit this per event)
lib/
  auth.ts                   # Better Auth server config
  auth-client.ts            # Better Auth client hooks
  db.ts                     # Mongoose connection
  r2.ts                     # Cloudflare R2 / S3 client
  gsap.ts                   # GSAP + ScrollTrigger setup
  utils.ts                  # Shared helpers
models/
  RSVP.ts                   # RSVP Mongoose schema
  Photo.ts                  # Photo/video Mongoose schema
stores/
  galleryStore.ts           # Zustand gallery state
types/
  index.ts                  # Shared TypeScript interfaces
scripts/
  seed-users.ts             # Seeds admin + viewer accounts
  generate-qr.ts            # Generates public/qr-upload.png
  set-r2-cors.ts            # Applies CORS rules to R2 bucket
public/                     # Static assets (music, photos, QR)
tests/                      # Unit and e2e tests
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/quince?retryWrites=true&w=majority

# Better Auth — generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=quince-uploads

# R2 public bucket domain (from R2 dashboard → Public Access)
R2_PUBLIC_URL=https://pub-xxxxxxx.r2.dev
R2_PUBLIC_HOSTNAME=pub-xxxxxxx.r2.dev

# Publicly accessible site URL (used for QR code generation)
NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app

# Optional: additional trusted origins for auth (comma-separated)
BETTER_AUTH_TRUSTED_ORIGINS=
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the event

Edit [`config/alexa.ts`](config/alexa.ts) with the event details:

- Event name, date, venue
- RSVP deadline
- Theme colors and fonts
- Hero photo and background music paths
- Padrinos, damas, chambelanes
- Her personal gallery photos

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Fill in MONGODB_URI, BETTER_AUTH_SECRET, R2 credentials, NEXT_PUBLIC_SITE_URL
```

### 4. Seed initial user accounts

Creates an admin account and a read-only viewer account.

```bash
npm run seed
```

### 5. Configure R2 CORS (one-time)

Required so browsers can PUT files directly to presigned R2 URLs. Requires an R2 API token with **Admin Read & Write** permissions.

```bash
npm run r2:cors
```

> Alternatively, set the CORS rules manually in the Cloudflare Dashboard under R2 → your bucket → Settings → CORS.

### 6. Generate the upload QR code (optional)

Generates `public/qr-upload.png` pointing to `NEXT_PUBLIC_SITE_URL/upload`. Print this for tables at the event so guests can upload photos from their phones.

```bash
npm run generate-qr
```

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run seed` | Seed admin + viewer user accounts |
| `npm run generate-qr` | Generate QR code for the upload page |
| `npm run r2:cors` | Apply CORS rules to the R2 bucket |

---

## Cloudflare R2 Setup

1. Create a bucket in the Cloudflare R2 dashboard and name it to match `R2_BUCKET_NAME`
2. Enable **Public Access** on the bucket and copy the public URL into `R2_PUBLIC_URL` / `R2_PUBLIC_HOSTNAME`
3. Create an API token with **Admin Read & Write** permissions and add the credentials to `.env.local`
4. Run `npm run r2:cors` once to configure cross-origin upload support

Photo uploads use presigned PUT URLs generated server-side — the client uploads directly to R2 without proxying through the Next.js server.

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel project settings
4. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the production domain
5. Deploy

The app uses the Next.js App Router and is compatible with Vercel's edge and serverless functions out of the box.

---

## Reusing for Another Event

1. Duplicate or edit `config/alexa.ts` and fill in the new event's details
2. Update `app/page.tsx` to import the new config
3. Swap out any photos in `public/`
4. Re-run `npm run seed` and `npm run generate-qr` for the new event

All display logic, animations, and layout pull from the config — no component edits needed for standard customization.
