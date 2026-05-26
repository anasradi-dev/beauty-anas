# BEAUTY Cosmetic Commission

BEAUTY is a Next.js application for managing cosmetic product sales on a commission basis. Sales representatives receive product batches, return deposited money after sales, and earn salary from sales volume.

## Features

- Navigation for Home, Sales Representatives, Products, Settlements, Sales, Product Batches, and Reports
- Representative list, details, product assignments, deposits, settlement dates, sales volume, commission salary, and summaries
- Admin-only add, edit, remove, and reset controls
- MongoDB API routes for representatives, products, collections, auth, and sample BEAUTY data seeding
- Local storage fallback when MongoDB is not configured

## MongoDB Setup

Create `.env` from `.env.example` and set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/beauty_anas
MONGODB_DB=beauty_anas
ADMIN_SIGNUP_CODE=ADMIN2026
AUTH_SECRET=change-this-long-random-secret
```

For MongoDB Atlas, use your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/beauty_anas
MONGODB_DB=beauty_anas
```

After changing `.env`, restart the dev server. Create the first admin from `/auth/signup` using the admin code.

If `MONGODB_URI` is empty, the app uses local development files in `data/` so signup/signin and admin editing still work on this machine.

Seed sample data after signing in as admin:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/beauty/seed -Method POST
```

Normal users can view data only. Only an admin session can create, update, delete, or reset app data.

## Development

```bash
npm run dev
npm run lint
npm run build
```
