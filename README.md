# BEAUTY Cosmetic Commission

BEAUTY is a Next.js application for managing cosmetic product sales on a commission basis. Sales representatives receive product batches, return deposited money after sales, and earn salary from sales volume.

## Features

- Navigation for Home, Sales Representatives, Products, Settlements, Sales, Product Batches, and Reports
- Representative list, details, product assignments, deposits, settlement dates, sales volume, commission salary, and summaries
- Add, edit, remove, and reset representatives
- MongoDB API routes for representative CRUD and sample BEAUTY data seeding
- Local storage fallback when MongoDB is not configured

## MongoDB Setup

Create `.env` from `.env.example` and set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/beauty_anas
MONGODB_DB=beauty_anas
```

Seed sample data after starting the dev server:

```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/beauty/seed -Method POST
```

## Development

```bash
npm run dev
npm run lint
npm run build
```
