# Electro Motors — Setup Guide

## 1. Supabase Setup

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (free tier is fine)
3. Wait for the project to initialize
4. Go to **Settings > API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Paste these into `.env.local`

## 2. Database Setup

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and run the contents of `supabase-schema.sql`
   - This creates tables: `cars`, `contact_requests`, `admin_users`
   - Seeds 6 initial cars from electro-motors.top
   - Sets up Row Level Security policies

## 3. Storage Setup

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket called `car-images`
3. Set it to **Public**
4. Run `supabase-storage.sql` in the SQL Editor

## 4. Create Admin User

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click "Add User" > "Create New User"
3. Enter your email and password
4. Copy the user's UUID
5. Run in SQL Editor:
   ```sql
   INSERT INTO admin_users (id, email, role)
   VALUES ('YOUR-USER-UUID', 'your@email.com', 'admin');
   ```

## 5. Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 6. Deploy

### Option A: Vercel (Recommended)
```bash
npm i -g vercel
vercel
```
Add environment variables in Vercel Dashboard > Settings > Environment Variables.

### Option B: Docker / VPS
```bash
npm run build
npm start
```
The `output: "standalone"` in next.config.ts creates a minimal production build.

### Option C: Static Export
If you want to host on a static server, change `next.config.ts`:
```ts
output: "export"
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |

## Dev Mode

Without Supabase configured, the app runs with local mock data:
- Login: `admin@electro-motors.top` / `admin123`
- Cars loaded from `src/lib/data.ts`
- Contact requests stored in memory (lost on restart)
