# Appora MVP

Appora is a code-based app discovery service: administrators publish official Google Play listings, and mobile users search a short code such as `GAME25`. It never hosts APK files.

## Project layout

- `backend/` — Express API, Supabase authorization, validation, uploads, and analytics.
- `admin/` — React/Vite dashboard for approved Supabase administrators.
- `mobile/` — Expo/React Native Android app.
- `supabase/migrations/001_initial_schema.sql` — PostgreSQL schema, RLS, policies, seeds, and Storage configuration.

## Prerequisites

- Node.js 22+ and npm.
- A Supabase project with email/password Auth enabled.
- A Supabase account owner to run the migration and create the first Auth user.

## Local setup

1. Copy each `.env.example` to `.env` in `backend`, `admin`, and `mobile`.
2. In Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql` once on a new project. For ongoing changes, use the Supabase CLI migration workflow.
3. Fill backend Supabase URL, anonymous/publishable key, and **service-role key**. The service-role key stays in `backend/.env` only.
4. Fill the admin public Supabase URL/key and API URL. Fill the mobile API URL with the computer's LAN IP when using a real phone; do not use `localhost` on the phone.
5. Install dependencies:

```powershell
npm install --prefix backend
npm install --prefix admin
npm install --prefix mobile
```

6. Start services in separate terminals:

```powershell
npm run dev --prefix backend
npm run dev --prefix admin
npm start --prefix mobile
```

The backend health check is `GET http://localhost:5000/api/health`.

## First administrator

1. In Supabase Authentication, create the administrator's email/password account (or invite the user) and copy its UUID.
2. In Supabase SQL Editor, run the following as a project owner, replacing the values:

```sql
insert into public.admin_users (user_id, display_name, role)
values ('AUTH-USER-UUID', 'Your name', 'admin');
```

There is deliberately no public admin-registration endpoint. Editors can be provisioned the same way with role `editor`.

## Storage and RLS

The migration creates a public-read `app-posters` bucket with a 5 MB JPEG/PNG/WebP restriction. Upload, update, and delete Storage policies require an authenticated administrator role. All database tables enable RLS. The API still checks the signed Supabase user and `admin_users` role before using the service-role server client.

## API summary

Public endpoints:

- `GET /api/health`
- `GET /api/apps/search?code=GAME25`
- `GET /api/apps?page=1&limit=20&category=1&sort=newest&search=word`
- `GET /api/apps/:id`
- `GET /api/categories`
- `POST /api/apps/:id/events` body: `{ "event_type": "search" | "detail_view" | "play_store_click" }`

Administrator endpoints require `Authorization: Bearer <Supabase access token>`:

- `GET, POST /api/admin/apps`, `GET, PUT, DELETE /api/admin/apps/:id`
- `PATCH /api/admin/apps/:id/status`
- `POST /api/admin/apps/:id/poster` multipart field `poster`
- `GET /api/admin/dashboard`, `GET /api/admin/analytics`
- `POST, PUT, DELETE /api/admin/categories`

## Testing

After dependencies are installed, build the dashboard with:

```powershell
npm run build --prefix admin
```

The hosted Supabase workflows require configured credentials and a test administrator. Verify health, code search, a published listing, an unpublished listing, admin authentication, poster upload, and mobile Play Store deep-linking. The API uses request validation, CORS, Helmet, rate limits, and safe JSON errors; test those against a local Supabase project before deployment.

## Deployment

Deploy `backend` to a Node-compatible HTTPS service and set all backend environment variables there. Deploy `admin` as the Vite build output with public-only `VITE_*` values. Update `ADMIN_ORIGIN`, the mobile API URL, and Supabase Auth redirect URLs to deployed origins. Create an Expo development build or production Android build after validating the API on a physical device.

Google AdMob is intentionally not integrated yet: it requires a current Expo-compatible native development build, AdMob account configuration, test-unit IDs, consent review, and policy confirmation. Core discovery remains fully usable without ads.
