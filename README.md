# DEZE (Detail Central)

A full-stack detailing marketplace app connecting customers with mobile/in-shop
car detailers. Modern, bold, dark-mode-first UI (Uber/Stripe-style) built on a
Node.js/Express API, React frontend, and PostgreSQL via Prisma.

This repo is currently a **project skeleton** — folders and config are in
place, but no features are implemented yet. It's set up so features can be
added systematically, one route/page/model at a time.

## Project structure

```
DEZE/
├── backend/            Express API (port 5000)
│   ├── routes/          API endpoint definitions, mounted under /api/*
│   ├── controllers/      Business logic called by routes
│   ├── middleware/        Auth guards, error handling
│   ├── config/            Database connection (Prisma client)
│   ├── utils/              Shared helpers
│   └── server.js            Express app entry point
│
├── frontend/            React app (Vite + Tailwind CSS, port 3000)
│   └── src/
│       ├── pages/         Top-level screens (routed via react-router-dom)
│       ├── components/     Reusable UI pieces
│       ├── services/        API call wrappers (axios)
│       ├── context/          React context / global state
│       └── styles/            Tailwind entrypoint + dark mode theme
│
├── database/            Prisma schema + seed script
│   ├── schema.prisma       Data model (template only so far)
│   └── seed.js              Test data seeding (template only so far)
│
├── .env.example         Backend environment variables template
└── frontend/.env.example  Frontend (VITE_*) environment variables template
```

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp ../.env.example .env   # fill in real values
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # fill in real values
npm run dev                # starts on http://localhost:3000
```

### 3. Database

The Prisma schema lives in `database/schema.prisma`. Once models are filled
in:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

## Tech stack

- **Backend:** Express, Prisma, bcryptjs, jsonwebtoken, cors, Stripe, Nodemailer
- **Frontend:** React (Vite), Tailwind CSS, react-router-dom, axios, Stripe.js, Mapbox GL
- **Database:** PostgreSQL (via Prisma)

## Design direction

Dark mode by default with vibrant accent colors for CTAs and highlights —
see `frontend/tailwind.config.js` (`colors.accent`). Keep new UI consistent
with that palette rather than introducing ad-hoc colors.

## Status

Skeleton only. Next up: data model design (`database/schema.prisma`), auth
routes, and the listings/booking flow.
