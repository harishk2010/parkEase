# ParkEase — Parking Management System

A full-stack parking management application for malls, theatres, and commercial spaces.

## Tech Stack

**Backend:** Node.js + Express.js + MongoDB (Mongoose)  
**Frontend:** React 18 + Vite + Tailwind CSS  
**Architecture:** Repository Pattern with Dependency Inversion

---

## Features

- **Floor Management** — Add/manage floors with configurable slots per vehicle type
- **Vehicle Types** — Configure categories (2-wheeler, 4-wheeler, heavy duty) with sub-classes and custom rates
- **Ticket Management** — Entry/exit tracking, auto slot assignment, ticket cancellation
- **Payment Management** — Billing with discount/tax, confirm/refund, analytics
- **Dashboard** — Live occupancy, revenue charts, active tickets

---

## Project Structure

```
parking-app/
├── backend/
│   └── src/
│       ├── config/         # DB connection
│       ├── interfaces/     # IRepository base class
│       ├── models/         # Mongoose schemas
│       ├── repositories/   # GenericRepository + specific repos
│       ├── services/       # Business logic
│       ├── controllers/    # Request handlers
│       ├── routes/         # Express routes (DI wired here)
│       ├── middleware/     # Error handler
│       ├── app.js
│       └── server.js
└── frontend/
    └── src/
        ├── components/     # Sidebar, UI primitives
        ├── pages/          # Dashboard, Floors, Vehicles, Tickets, Payments
        ├── services/       # API layer (axios)
        ├── App.jsx
        └── main.jsx
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (proxies /api → localhost:5000)

---

## API Reference

### Floors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/floors | Get all floors |
| POST | /api/floors | Create floor (with slot config) |
| PUT | /api/floors/:id | Update floor |
| DELETE | /api/floors/:id | Deactivate floor |
| GET | /api/floors/occupancy-summary | Live occupancy per floor |

### Vehicle Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vehicle-types | Get all types |
| POST | /api/vehicle-types | Create type |
| POST | /api/vehicle-types/:id/subclasses | Add sub-class |
| DELETE | /api/vehicle-types/:id/subclasses/:subClassId | Remove sub-class |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tickets | Get all tickets (filter: status, vehicleCategory) |
| POST | /api/tickets | Create entry ticket (auto-assigns slot) |
| PATCH | /api/tickets/exit/:ticketNumber | Process vehicle exit |
| PATCH | /api/tickets/:id/cancel | Cancel ticket |
| GET | /api/tickets/active | All active tickets |
| GET | /api/tickets/stats/daily | Daily stats |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/payments | Get all payments |
| POST | /api/payments | Create payment for exited ticket |
| PATCH | /api/payments/:id/confirm | Mark as paid |
| PATCH | /api/payments/:id/refund | Refund |
| GET | /api/payments/stats/revenue | Revenue stats |
| GET | /api/payments/stats/daily | Daily revenue (last N days) |
| GET | /api/payments/stats/methods | Breakdown by payment method |

---

## Architecture Notes

- `IRepository` — base interface; all repos extend `GenericRepository`
- `GenericRepository` — implements CRUD with Mongoose; concrete repos override as needed
- **Dependency Injection** wired in route files: `repo → service → controller → router`
- Controllers are the only layer that uses `try/catch` and calls `next(error)`
- Services throw plain objects `{ status, message }` for HTTP errors
