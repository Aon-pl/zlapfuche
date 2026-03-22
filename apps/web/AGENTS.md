# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository overview

Monorepo containing two separate apps, each with its own `git` history:
- `apps/web` — Next.js 16 (App Router) web application with REST API used by both the browser and the mobile app
- `apps/mobile` — React Native / Expo (SDK 55) mobile application

## Web app (`apps/web`)

### Commands

```bash
# Development server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Linting
pnpm lint

# Prisma: generate client after schema changes
npx prisma generate

# Prisma: push schema to DB (dev only, no migrations)
npx prisma db push

# Prisma: open Prisma Studio
npx prisma studio
```

No test runner is configured for the web app.

### Environment variables

Required in `.env`:
- `DATABASE_URL` — MySQL connection string
- `AUTH_SECRET` — secret used by NextAuth (web sessions) and `jsonwebtoken` (mobile JWTs)
- `NEXTAUTH_URL` — public URL of the web app
- Email-sending variables for Nodemailer (see `lib/email.ts`)

### Architecture

**Authentication — two configs, same secret**

The project uses NextAuth v5 with a split auth setup to respect Next.js Edge/Node runtimes:
- `auth.edge.ts` — imported by `middleware.ts`; Edge-safe (no Prisma, no Node APIs); handles JWT reading only
- `auth.node.ts` — imported by all API routes and Server Components; includes the Credentials provider and Prisma-backed `authorize()`

Mobile clients use plain JWTs (via `jsonwebtoken`, same `AUTH_SECRET`). `lib/apiHelpers.ts` provides `getMobileUser(req)` to verify them and `createMobileToken()` to issue them from `POST /api/auth/login`.

**Database**

MySQL via Prisma. Key models and their relationships:
- `User` → one `PersonProfile` or one `CompanyProfile`; roles: `person | company | admin`
- `JobOffer` — can belong to a company *or* a person (freelance-style offers); has `status` (active/paused/closed/expired/blocked), `JobCategory`, and `SalaryType`
- `JobSeeker` — optional 1-to-1 extension of `PersonProfile` for workers who want to be found
- `Application` — person applies to a `JobOffer`; unique per (offerId, applicantId)
- `Conversation` — two types: `person_company` (requires a job offer) and `person_person`
- `Message` — belongs to a `Conversation`; sender is tracked via three nullable FK fields (`senderPersonId`, `senderCompanyId`, `senderTargetPersonId`)
- `Review` — bidirectional; `ReviewType` distinguishes direction; company can add a reply (`companyReply`)
- `Notification` — per-user; pushed via SSE (`/api/notifications/stream`)

**API route patterns**

- All handlers return `apiSuccess(data)` / `apiError(message, status)` from `lib/apiHelpers.ts`
- Web session auth: `const session = await auth()` (imports from `@/auth.node`)
- Mobile auth: `const user = await getMobileUser(req)` (reads Bearer JWT)
- Admin guard in Server Components/pages: `await requireAdmin()` from `lib/requireAdmin.ts`
- SSE endpoints (`/api/notifications/stream`, `/api/chat/[conversationId]/stream`) poll the DB every 5 s and emit heartbeats every 30 s

**Server Actions (`app/actions/`)**

Used from Server and Client Components instead of API routes for mutations that don't need to be called from the mobile app. Always import `auth` from `@/auth.node` inside actions.

**Middleware**

`middleware.ts` protects `/dashboard`, `/profile`, `/offers/new` (redirect to `/login` if unauthenticated) and redirects already-logged-in users away from `/login` and `/register`.

**Real-time notifications**

`lib/notifications.ts` exports helpers (`notifyNewApplication`, `notifyApplicationStatusChange`, `notifyNewMessageToUser`) that write `Notification` rows. The SSE stream picks them up on the next poll.

**Salary radius filtering**

`app/actions/offers.ts` contains a hardcoded map of Polish city coordinates (`CITY_COORDS`). Radius filtering is done **in memory** after fetching all matching offers — avoid enabling it for large result sets.

---

## Mobile app (`apps/mobile`)

### Commands

```bash
# Start Expo dev server
pnpm start

# Android
pnpm android

# iOS
pnpm ios
```

### Environment / dev setup

The API base URL is set in `lib/api.ts`. During development, change `API_URL` to your machine's LAN IP:

```ts
// lib/api.ts
export const API_URL = __DEV__
  ? 'http://<YOUR_LAN_IP>:3000/api'
  : 'https://yourdomain.com/api'
```

### Architecture

- Expo Router (`expo-router`) for file-based navigation; route groups: `(auth)` and `(tabs)`
- `lib/AuthContext.tsx` — global auth state via React Context; tokens stored in `expo-secure-store` under keys `auth_token` and `auth_user`
- `lib/api.ts` — axios instance that automatically attaches the stored JWT as `Authorization: Bearer <token>` on every request
- All API calls go through the Next.js web app — the mobile app has **no separate backend**
