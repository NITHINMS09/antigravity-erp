# Antigravity ERP - Deployment Guide

This guide details the exact environment variables and configurations required to successfully deploy the ERP system to production platforms like Vercel (Frontend) and Render/Railway (Backend).

## 1. Database (PostgreSQL)

You must use a managed PostgreSQL database for production. Using SQLite will result in data loss on every deployment or server restart.

**Recommended Free Providers**:
- [Neon.tech](https://neon.tech)
- [Supabase](https://supabase.com)
- [Render PostgreSQL](https://render.com)

Once you create a database, you will get a connection string that looks like this:
`postgresql://user:password@host:port/dbname?sslmode=require`

## 2. Backend Environment Variables (Render / Railway)

In your backend hosting dashboard, go to the Environment Variables section and add the following:

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations and strict error handling. |
| `PORT` | `5000` | The port your backend listens on (Render automatically sets this, but it's good to specify). |
| `DATABASE_URL` | `postgresql://...` | The connection string from your PostgreSQL provider. |
| `JWT_SECRET` | `your-super-secret-key-12345` | A strong, random string used to sign auth tokens. |
| `JWT_EXPIRES_IN` | `7d` | How long sessions last. |
| `FRONTEND_URL` | `https://your-frontend-domain.vercel.app` | **CRITICAL:** This allows your frontend to bypass CORS blocks. |

### Prisma Deployment Command
Make sure your backend build command runs Prisma migrations before starting:
- **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
- **Start Command**: `npm start`

## 3. Frontend Environment Variables (Vercel)

In your Vercel project dashboard, go to Settings -> Environment Variables and add the following:

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-domain.onrender.com/api` | **CRITICAL:** Next.js uses this to correctly route API requests to your live backend. If missing, it defaults to `localhost:5000`. |

*(Note: Do not put a trailing slash after `/api`)*

## 4. Final Verification Checklist

- [ ] Ensure `NEXT_PUBLIC_API_URL` exactly matches the live backend URL.
- [ ] Ensure `FRONTEND_URL` in the backend exactly matches the Vercel domain (without a trailing slash).
- [ ] Ensure the PostgreSQL database is actively running and the `DATABASE_URL` is correct.
- [ ] Register a new account on the live Vercel site and verify it succeeds.
- [ ] Refresh the page to ensure the session persists.
