# Traveloop ✈️

A full-stack travel planning web application. Plan trips, build itineraries, track budgets, manage packing lists, and share your adventures.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (via Prisma ORM) |
| Auth | JWT (stored in localStorage) |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |

## Quick Start

### 1. Setup Server

```bash
cd server
cp ../.env.example .env          # copy env file
npm install                       # install deps
npx prisma migrate dev --name init  # create DB + tables
npm run seed                      # seed demo data
npm run dev                       # start server on :5000
```

### 2. Setup Client

```bash
cd client
npm install
npm run dev                       # start frontend on :5173
```

### 3. Open in browser

```
http://localhost:5173
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| User | demo@traveloop.com | demo1234 |
| Admin | admin@traveloop.com | admin1234 |

## Environment Variables (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite path | `file:./dev.db` |
| `JWT_SECRET` | JWT signing secret | — |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Features

### 14 Screens
1. **Login / Signup** — Auth with forgot password UI
2. **Dashboard** — Welcome, recent trips, recommendations
3. **Create Trip** — Form with cover photo upload + validation
4. **My Trips** — Grid with edit/view/delete
5. **Itinerary Builder** — Add stops, drag-to-reorder, add activities
6. **Itinerary View** — List + Calendar view, print support
7. **City Search** — Debounced search with region filter
8. **Activity Search** — Filter by type, cost, duration
9. **Budget** — Editable costs + Recharts pie + bar charts
10. **Packing Checklist** — Categorized items with progress bar
11. **Shared Trip** — Public read-only view with social share + copy
12. **Profile** — Edit name/photo/email/language, change password
13. **Trip Notes** — Journal tied to trip or specific stops
14. **Admin** — Stats, top cities chart, user management table

### API Routes
- `POST /api/auth/signup|login|logout`
- `GET|POST|PUT|DELETE /api/trips/:id`
- `POST|PUT|DELETE /api/stops`, `PATCH /api/stops/reorder`
- `GET /api/cities?search=&region=`
- `GET /api/activities/city/:id`, `POST /api/activities/stop/:id`
- `GET|PUT /api/budget/:tripId`
- `GET|POST /api/packing/:tripId`, `PATCH|DELETE /api/packing/item/:id`
- `GET|POST /api/notes/:tripId`, `PUT|DELETE /api/notes/note/:id`
- `GET|PUT|DELETE /api/profile`
- `GET /api/admin/stats|users`, `PATCH /api/admin/users/:id/toggle`
- `GET /api/share/:slug`, `POST /api/share/:slug/copy`

## Project Structure

```
traveloop/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── pages/          # 14 screen components
│       ├── components/     # Shared UI (Navbar, Modal, Skeleton...)
│       ├── api/            # Axios instance + API helpers
│       └── store/          # AuthContext
│
└── server/                 # Express backend
    ├── src/
    │   ├── routes/         # 11 route files
    │   └── middleware/     # auth.ts, upload.ts
    └── prisma/
        ├── schema.prisma   # DB schema (9 models)
        └── seed.ts         # Seed data
```

## Authentication

JWTs are stored in `localStorage` under key `traveloop_token`. Every API request attaches it via an Axios request interceptor. On 401 responses, the interceptor clears the token and redirects to `/login`.
