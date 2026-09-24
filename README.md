# Dhaka Tesla Pool

> *"Share a seat. Split the fare. Survive Dhaka traffic."*

Dhaka Tesla Pool is a high-reliability, full-stack ride-sharing MVP designed specifically for the unique transportation challenges of Dhaka, Bangladesh. It enables multiple passengers traveling along the same corridor (such as Banani to Mohakhali) to share an electric vehicle (such as Jashim's 3-passenger Tesla "Bullet"), splitting the fare transparently while strictly enforcing seat capacity limits and concurrency safety.

---

## 🎥 Project Walkthrough Video

[![Watch Walkthrough Video](https://img.shields.io/badge/▶%20Watch%20Walkthrough-Google%20Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/file/d/1JsHdWH--jeZjJDafSt56gyqeA0noKc3Z/view?usp=drive_link)
[![Live Backend API](https://img.shields.io/badge/Live%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://dhaka-tesla-pool.onrender.com)
[![Database](https://img.shields.io/badge/PostgreSQL%2016-Neon.tech-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)

📺 **Video Link**: [https://drive.google.com/file/d/1JsHdWH--jeZjJDafSt56gyqeA0noKc3Z/view?usp=drive_link](https://drive.google.com/file/d/1JsHdWH--jeZjJDafSt56gyqeA0noKc3Z/view?usp=drive_link)

### Video Outline & Timestamps (6 Minutes):
| Timestamp | Segment | Key Topics Covered |
| :--- | :--- | :--- |
| **0:00 – 1:00** | **Problem, Users & Core Idea** | Dhaka traffic gridlock, high-density Banani corridor, commuter personas (Nusrat, Rafiq, Shirin), EV driver Jashim with 3-passenger Tesla "Bullet", and automatic 25% pool discount. |
| **1:00 – 3:00** | **Architecture, Decisions & Trade-offs** | Modular Monolith (Express.js + Next.js 15), PostgreSQL 16 row-level pessimistic locking (`SELECT ... FOR UPDATE`), exact integer poisha calculations, FSM ride lifecycle, Architecture Diagram & ERD. |
| **3:00 – 6:00** | **Product Tour, Edge Cases & Deployment** | Story Simulator walkthrough, 1st & 2nd passenger auto-pooling, 3rd seat saturation, 4th passenger 409 rejection edge case, payment ledger settlement, and live Render + Neon cloud deployment. |

---

## Table of Contents

0. [Project Walkthrough Video](#-project-walkthrough-video)
1. [Project Summary](#1-project-summary)
2. [Problem Statement & Dhaka Traffic Context](#2-problem-statement--dhaka-traffic-context)
3. [Core Features](#3-core-features)
4. [Architecture Overview](#4-architecture-overview)
5. [Architecture Diagram](#5-architecture-diagram)
6. [Entity Relationship Diagram (ERD)](#6-entity-relationship-diagram-erd)
7. [Tech Stack](#7-tech-stack)
8. [Why Each Technology Was Chosen](#8-why-each-technology-was-chosen)
9. [Project Structure](#9-project-structure)
10. [Prerequisites](#10-prerequisites)
11. [Environment Variables](#11-environment-variables)
12. [Local Setup Guide](#12-local-setup-guide)
13. [Docker Setup Guide](#13-docker-setup-guide)
14. [Database Migrations](#14-database-migrations)
15. [Database Seed Data](#15-database-seed-data)
16. [API Specification & Endpoints](#16-api-specification--endpoints)
17. [Automated Testing Guide](#17-automated-testing-guide)
18. [Evaluator Demo Credentials](#18-evaluator-demo-credentials)
19. [Deployment Guide](#19-deployment-guide)
20. [Known Limitations](#20-known-limitations)
21. [Future Improvements](#21-future-improvements)
22. [AI Usage Disclosure](#22-ai-usage-disclosure)
23. [Final Demo Scenario Walkthrough](#23-final-demo-scenario-walkthrough)

---

## 1. Project Summary

- **Repository**: `dhaka-tesla-pool`
- **Frontend**: Next.js 15 (App Router, Tailwind CSS, Lucide React, TypeScript)
- **Backend API**: Node.js, Express, TypeScript, Zod, JWT Authentication
- **Database & Persistence**: PostgreSQL 16, Prisma ORM 6.x
- **Testing**: Vitest, Supertest (100% passing business tests)
- **Containerization**: Docker, Docker Compose

---

## 2. Problem Statement & Dhaka Traffic Context

Dhaka is one of the densest and most congested megacities in the world. Commuters navigating key transit arteries (e.g. Airport Road, Mirpur Road, Pragati Sarani) regularly lose 2 to 4 hours daily in gridlock. 

Traditional single-passenger ride-hailing services saturate roads with single-occupant vehicles, inflating surge pricing during peak hours and exacerbating gridlock. Meanwhile, public transit options are overcrowded and lack predictability.

**Dhaka Tesla Pool solves this by:**
1. **Corridor Pooling**: Matching passengers whose pickup points are within a tight 2.0 km radius along high-density corridors into a shared electric vehicle.
2. **Transparent, Predictable Pricing**: Eliminating opaque surge algorithms in favor of a fixed, transparent formula computed in exact integer poisha with an automatic **25% pooling discount**.
3. **Guaranteed Capacity Protection**: Enforcing hard limits on seat availability so no vehicle is ever overbooked, even under intense concurrent booking bursts.
4. **Privacy-Preserving Fare Transparency**: Ensuring passengers see their exact individual fare and savings without leaking other riders' private details.

---

## 3. Core Features

### 👤 Authentication & Role-Based Access Control (RBAC)
- Secure user registration and login with bcrypt password hashing (cost factor 10).
- Signed 7-day JWT tokens with role separation (`PASSENGER` vs `DRIVER`).
- **1-Click Evaluator Demo Buttons**: Instantly authenticates as Jashim (Driver), Nusrat (Passenger), Rafiq (Passenger), or Shirin (Passenger).

### 🚖 Corridor Pooling & Smart Matching
- 9 predefined Dhaka geographical hubs with exact GPS coordinates (Banani, Gulshan 1 & 2, Mohakhali, Uttara, Mirpur, Farmgate, Dhanmondi, Motijheel).
- Real-time Haversine distance estimation.
- Automatic corridor matching for open driver pools within 2.0 km pickup tolerance.

### 💺 Concurrency & Capacity Enforcement
- Strict vehicle capacity tracking (e.g., Tesla "Bullet" capacity = 3 passengers).
- Concurrency race conditions resolved via PostgreSQL **Row-Level Pessimistic Locking** (`SELECT id FROM pools WHERE id = $1 FOR UPDATE`) inside isolated Prisma database transactions.
- Zero overbooking: 4th passenger is safely rejected or assigned to a new pool.

### 💰 Transparent Integer Poisha Fare Engine
- Standardized formula: $\text{Base Fare (৳60.00)} + \text{Distance (৳20.00/km)} - \text{Pool Discount (25\%)}$.
- Computed in integer **poisha** ($1\text{ BDT} = 100\text{ poisha}$) to eliminate floating-point drift.
- Real-time pre-booking fare estimate endpoint (`POST /api/rides/estimate`).

### 🔄 Ride Lifecycle Finite State Machine (FSM)
- Strict state progression: `REQUESTED` $\rightarrow$ `MATCHED` $\rightarrow$ `DRIVER_ARRIVED` $\rightarrow$ `STARTED` $\rightarrow$ `COMPLETED`.
- Reversible cancellation window allowed during `REQUESTED`, `MATCHED`, and `DRIVER_ARRIVED` (instantly releasing reserved seats).
- Automatic creation of finalized `Payment` record upon completion.
- Full immutable audit trail stored in `RideStatusHistory`.

### 🖥️ Modern Driver Cockpit & Passenger Dashboard
- **Driver Cockpit**: Availability toggle (`Online` / `Offline`), visual live seat meter (e.g., `2/3 occupied`), passenger roster with pickup/dropoff points, and stepped state transition buttons (`Mark Arrived`, `Start Trip`, `Complete Trip`).
- **Passenger Dashboard**: Quick ride booking, live route estimation, active ride tracking timeline, cancel button, and filterable ride history.

---

## 4. Architecture Overview

Dhaka Tesla Pool is architected as a **Modular Monolith**. 

Rather than adopting complex distributed microservices with Kafka, Redis, or Kubernetes—which introduce network partition risks, distributed transaction complexity, and high hosting overhead—the system leverages:
1. **Single Express API Gateway** with modular domain separation (`auth`, `rides`, `pools`, `drivers`, `fares`).
2. **ACID Transactions & Row-Level Locking** in PostgreSQL for state and capacity consistency.
3. **Next.js 15 Client** communicating over JSON REST endpoints with JWT bearer authentication.

---

## 5. Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Presentation Layer (Port 3000)"]
        Browser["Web Browser (User / Evaluator)"]
        NextJS["Next.js 15 App Router<br/>(Tailwind CSS • Auth Context • Responsive Dashboard)"]
        Browser <--> NextJS
    end

    subgraph API["Backend API Layer (Port 5000)"]
        Express["Express.js Server"]
        AuthMid["JWT Auth Middleware & RBAC"]
        Zod["Zod Input Validation"]
        
        subgraph Services["Domain Modules"]
            AuthSvc["Auth Module (Bcrypt & JWT)"]
            RidesSvc["Rides & Fare Service"]
            PoolsSvc["Pooling Engine & Corridor Matching"]
            DriversSvc["Driver Cockpit & FSM Lifecycle"]
        end
    end

    subgraph Persistence["Data & Concurrency Layer (Port 5432)"]
        Prisma["Prisma ORM 6.x"]
        PessimisticLock["Postgres Row Lock<br/>(SELECT ... FOR UPDATE)"]
        Postgres[("PostgreSQL 16 Database<br/>8 Relational Models • Foreign Keys • Cascades")]
    end

    NextJS -->|REST API Calls + Bearer Token| Express
    Express --> AuthMid --> Zod
    Zod --> AuthSvc
    Zod --> RidesSvc
    Zod --> PoolsSvc
    Zod --> DriversSvc

    AuthSvc --> Prisma
    RidesSvc --> Prisma
    PoolsSvc --> Prisma
    DriversSvc --> Prisma

    Prisma --> PessimisticLock
    PessimisticLock --> Postgres
```

For extended lifecycle and concurrency diagrams, see [`docs/architecture.md`](docs/architecture.md).

---

## 6. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o| vehicles : "owns (1:1)"
    users ||--o{ ride_requests : "requests (1:N)"
    users ||--o{ pool_members : "participates (1:N)"
    users ||--o{ payments : "pays (1:N)"

    vehicles ||--o{ pools : "operates (1:N)"

    pools ||--o{ pool_members : "contains (1:N)"

    ride_requests ||--o| pool_members : "assigned_to (1:1)"
    ride_requests ||--o| fares : "calculated_for (1:1)"
    ride_requests ||--o{ payments : "settled_by (1:N)"
    ride_requests ||--o{ ride_status_history : "tracks (1:N)"

    users {
        string id PK
        string name
        string email UK
        string password_hash
        UserRole role
        datetime created_at
    }

    vehicles {
        string id PK
        string driver_id FK,UK
        string name
        int capacity
        boolean is_online
    }

    ride_requests {
        string id PK
        string passenger_id FK
        string pickup_area
        string destination_area
        int seats_requested
        RideRequestStatus status
        int estimated_fare_poisha
    }

    pools {
        string id PK
        string vehicle_id FK
        PoolStatus status
    }

    pool_members {
        string id PK
        string pool_id FK
        string ride_request_id FK,UK
        string passenger_id FK
        int seats
        int fare_poisha
    }

    fares {
        string id PK
        string ride_request_id FK,UK
        int base_fare_poisha
        int distance_charge_poisha
        int pool_discount_poisha
        int final_fare_poisha
    }

    payments {
        string id PK
        string ride_request_id FK
        string passenger_id FK
        int amount_poisha
        PaymentMethod method
        PaymentStatus status
    }

    ride_status_history {
        string id PK
        string ride_request_id FK
        RideRequestStatus from_status
        RideRequestStatus to_status
        string changed_by
    }
```

For complete field types and index specifications, see [`docs/erd.md`](docs/erd.md).

---

## 7. Tech Stack

| Component | Selected Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 15.2.x | Server/Client rendering, reactive UI, clean routing |
| **Frontend Styling** | Tailwind CSS | 3.4.x | Rapid styling, high-contrast dark theme, responsive grid |
| **Icons** | Lucide React | 0.475.x | Consistent, lightweight vector iconography |
| **Backend Runtime** | Node.js | 22.x LTS | Performant asynchronous JavaScript runtime |
| **API Framework** | Express.js | 4.21.x | Minimal, un-opinionated, battle-tested HTTP routing |
| **Type System** | TypeScript | 5.7.x | Full-stack static typing and schema verification |
| **ORM** | Prisma | 6.4.x | Type-safe query builder, declarative migrations |
| **Database** | PostgreSQL | 16-alpine | ACID transactions, row-level locking, relational integrity |
| **Validation** | Zod | 3.24.x | Runtime request body and environment validation |
| **Testing** | Vitest + Supertest | 3.0.x / 7.0.x | High-speed unit and end-to-end integration testing |
| **Containerization** | Docker & Docker Compose | 3.8+ | Zero-configuration single-command environment deployment |

---

## 8. Why Each Technology Was Chosen

To satisfy the non-mandated technology architectural rationale requirements:

| Technology | What Alternatives Exist? | Why Did We Choose It? | When Would We Switch? |
| :--- | :--- | :--- | :--- |
| **Express.js (Backend)** | NestJS, Fastify, Go Gin | Lightweight, zero boilerplate, transparent middleware model, easy for any reviewer to audit. | If the team grows beyond 10 engineers needing strict enterprise module encapsulation (switch to NestJS) or extreme throughput >100k req/s (switch to Go). |
| **Prisma ORM** | Drizzle ORM, TypeORM, raw SQL | Best-in-class developer experience, auto-generated TypeScript types, declarative migrations, schema introspection. | If sub-millisecond query optimization or complex dynamic CTEs become dominant bottlenecks (switch to Drizzle ORM or Kysely). |
| **PostgreSQL 16** | MySQL, MongoDB, DynamoDB | Robust ACID guarantees, native row-level pessimistic locking (`SELECT FOR UPDATE`), reliable constraint cascades. | Never for financial/concurrency core; would augment with Redis for caching if read volume exceeded 50,000 QPS. |
| **Tailwind CSS** | CSS Modules, Styled Components | Utility-first, zero runtime CSS overhead, rapid iteration of dark-mode UI with high visual polish. | If building a cross-platform web + React Native design system (switch to Tamagui or StyleX). |
| **Vitest** | Jest, Mocha | Native ES modules support, identical syntax to Jest, 5x faster execution, out-of-the-box TypeScript support via Vite. | If required to run in an legacy CommonJS-only proprietary pipeline that lacks ESM loaders. |
| **Integer Poisha** | JavaScript `Number` / Float | Eliminates IEEE 754 floating point inaccuracies (e.g. `0.1 + 0.2 != 0.3`). Critical for financial reliability. | Never; standard international banking practice is to store currencies in minor units (cents, pence, poisha). |

---

## 9. Project Structure

```text
dhaka-tesla-pool/
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Applied database schema migrations
│   │   ├── schema.prisma           # 8 Prisma models, enums & relations
│   │   └── seed.ts                 # Database seed script (Jashim, Nusrat, Rafiq, Shirin)
│   ├── src/
│   │   ├── config/
│   │   │   ├── dhaka-geography.ts  # Predefined Dhaka hubs & coordinates
│   │   │   └── env.ts              # Zod environment variable parsing
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT verification & role guards
│   │   │   ├── error.middleware.ts # Centralized JSON error handler
│   │   │   └── validate.middleware.ts # Zod request validation
│   │   ├── modules/
│   │   │   ├── auth/               # Register, login, profile endpoints & tests
│   │   │   ├── drivers/            # Driver cockpit, vehicle, and lifecycle controls
│   │   │   ├── fares/              # Integer poisha fare calculation unit tests
│   │   │   ├── pools/              # Pool matching, capacity & concurrency tests
│   │   │   └── rides/              # Passenger ride request & history endpoints
│   │   ├── utils/
│   │   │   ├── haversine.ts        # Spherical distance calculation
│   │   │   ├── prisma.ts           # Shared PrismaClient singleton
│   │   │   └── response.ts         # Standardized API response wrappers
│   │   ├── app.ts                  # Express application setup
│   │   └── server.ts               # Server bootstrap & port listener
│   ├── docker-entrypoint.sh        # Auto migration & seeding on container start
│   ├── Dockerfile                  # Multi-stage production container
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── app/
│   │   ├── driver/                 # Driver cockpit page (seat meter & roster)
│   │   ├── login/                  # 1-click demo login page
│   │   ├── passenger/              # Passenger ride booking & active ride page
│   │   │   └── history/            # Filterable ride history audit page
│   │   ├── register/               # New user registration page
│   │   ├── layout.tsx              # Root HTML & AuthContext provider
│   │   └── page.tsx                # High-contrast Tesla dark landing page
│   ├── components/
│   │   ├── Navbar.tsx              # Role-aware responsive navigation bar
│   │   ├── RideTimeline.tsx        # Visual state machine progress tracker
│   │   └── SeatMeter.tsx           # Visual capacity gauge (e.g. 2/3 occupied)
│   ├── lib/
│   │   ├── api.ts                  # Fetch API wrapper with auth token injection
│   │   └── auth-context.tsx        # React Context for login state & logout
│   ├── Dockerfile                  # Multi-stage production container
│   ├── package.json
│   └── tailwind.config.ts
├── docs/
│   ├── architecture.md             # In-depth system & FSM diagrams
│   └── erd.md                      # Detailed ERD & relational constraints
├── docker-compose.yml              # Complete orchestration (postgres, backend, frontend)
├── .env.example                    # Template environment variables
└── README.md                       # Complete project documentation
```

---

## 10. Prerequisites

Before running locally, ensure you have installed:
- **Node.js**: v20+ or v22 LTS (`node -v`)
- **npm**: v10+ (`npm -v`)
- **Docker & Docker Compose**: Docker 24+ (`docker compose version`)
- **PostgreSQL**: v16 (if running without Docker)

---

## 11. Environment Variables

Copy the provided `.env.example` file:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Backend API port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `CORS_ORIGIN` | Allowed web frontend origin | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/dhaka_tesla_pool?schema=public` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `dhaka-tesla-pool-super-secret-key-change-in-production` |
| `JWT_EXPIRES_IN`| Token expiration timeframe | `7d` |
| `NEXT_PUBLIC_API_URL` | Base API URL accessible from browser | `http://localhost:5000/api` |

---

## 12. Local Setup Guide

If you prefer running services directly on your host machine:

### 1. Start PostgreSQL
```bash
# Start Postgres using the project Docker Compose service
docker compose up -d postgres
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed database with initial users and vehicle
npm run seed

# Run backend development server
npm run dev
# -> Server running on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev
# -> Web app running on http://localhost:3000
```

---

## 13. Docker Setup Guide

To spin up the entire application stack (PostgreSQL, Backend API, and Next.js Frontend) in a single command:

```bash
docker compose up --build
```

- **Frontend**: Accessible at `http://localhost:3000`
- **Backend API**: Accessible at `http://localhost:5000/api`
- **Healthcheck**: `http://localhost:5000/api/health`
- **Postgres**: Available on host port `5432`

> **Note on automated initialization**: The backend container automatically runs `npx prisma migrate deploy` and `npx tsx prisma/seed.ts` upon startup via `docker-entrypoint.sh`. No manual migration commands are required!

To stop containers:
```bash
docker compose down
```

---

## 14. Database Migrations

Database schema changes are managed through Prisma's declarative migration engine:

```bash
cd backend

# Apply existing migrations
npx prisma migrate deploy

# Create a new migration after editing schema.prisma
npx prisma migrate dev --name <migration_name>

# View database via Prisma Studio GUI
npx prisma studio
```

---

## 15. Database Seed Data

Running the seed command populates the database with initial users and the vehicle:

```bash
cd backend
npm run seed
```

### Seeded Users

| Name | Role | Email | Password | Assigned Vehicle |
| :--- | :--- | :--- | :--- | :--- |
| **Jashim** | `DRIVER` | `jashim@tesla.dhaka` | `Password123!` | Tesla Model 3 ("Bullet", Capacity: 3) |
| **Nusrat** | `PASSENGER` | `nusrat@tesla.dhaka` | `Password123!` | — |
| **Rafiq** | `PASSENGER` | `rafiq@tesla.dhaka` | `Password123!` | — |
| **Shirin** | `PASSENGER` | `shirin@tesla.dhaka` | `Password123!` | — |

---

## 16. API Specification & Endpoints

All responses follow a consistent, standardized envelope format:
```json
{
  "success": true,
  "data": { ... }
}
```
Or for errors:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Authentication Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new passenger or driver |
| `POST` | `/api/auth/login` | Public | Authenticate user & return 7-day JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile of the current user |

### Passenger Ride Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/rides/estimate` | Public/Auth | Estimate distance and fare in poisha |
| `POST` | `/api/rides` | Passenger | Request a ride (auto-pools if corridor available) |
| `GET` | `/api/rides/my-rides` | Passenger | Retrieve current passenger's active & past rides |
| `GET` | `/api/rides/:id` | Passenger | Retrieve ride details (with strict privacy check) |
| `PATCH` | `/api/rides/:id/cancel` | Passenger | Cancel ride (releases seat from pool) |

### Driver Cockpit & Lifecycle Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/driver/online` | Driver | Toggle driver availability (`isOnline`) |
| `GET` | `/api/driver/vehicle` | Driver | Get vehicle details and seat capacity |
| `GET` | `/api/driver/pool/current` | Driver | Get active pool, members, and occupied seats |
| `GET` | `/api/driver/requests` | Driver | View pending ride requests along corridors |
| `POST` | `/api/driver/rides/:id/accept` | Driver | Explicitly accept request into driver pool |
| `PATCH` | `/api/driver/rides/:id/arrive` | Driver | Mark driver arrived at pickup (`DRIVER_ARRIVED`) |
| `PATCH` | `/api/driver/rides/:id/start` | Driver | Start trip with passengers (`STARTED`) |
| `PATCH` | `/api/driver/rides/:id/complete` | Driver | Complete trip (`COMPLETED`, settles fare) |
| `PATCH` | `/api/driver/pool/advance` | Driver | Advance entire pool to next lifecycle state |

### Health Endpoint

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health & timestamp |

---

## 17. Automated Testing Guide

The project maintains an automated test suite verifying all critical business invariants, state transitions, fare math, and concurrent bookings.

### Running Backend Tests
```bash
cd backend
npm test
```

### Test Coverage Highlights (44 Automated Tests Across 8 Suites):
1. **Capacity Enforcement**: Ensures that when 3 seats in "Bullet" are occupied, a 4th passenger is safely rejected with HTTP 409 (`POOL_FULL`).
2. **Invalid State Transition Guard**: Rejects illegal transitions (e.g. attempting to move from `COMPLETED` $\rightarrow$ `STARTED`) with HTTP 400 (`INVALID_STATUS_TRANSITION`).
3. **Fare Engine Precision**: Confirms exact integer poisha calculation ($Base + Distance - Discount$) without rounding drift.
4. **Ownership & Privacy**: Asserts that Passenger A attempting to query or cancel Passenger B's ride receives HTTP 403 Forbidden.
5. **Concurrency Safety**: Simulates simultaneous seat requests claiming the final seat using `Promise.all`. Verifies that exactly one passenger succeeds while the second is safely queued or reassigned.
6. **Cancellation Lifecycle**: Verifies seats are released and pool membership cleaned up upon passenger cancellation.

---

## 18. Evaluator Demo Credentials

The web application at `/login` provides **1-Click Demo Login Buttons** that instantly fill credentials and log you in. Alternatively, use:

- **Driver**:
  - Email: `jashim@tesla.dhaka`
  - Password: `Password123!`
  - Vehicle: Tesla Model 3 "Bullet" (Capacity: 3)
- **Passenger 1**:
  - Email: `nusrat@tesla.dhaka`
  - Password: `Password123!`
- **Passenger 2**:
  - Email: `rafiq@tesla.dhaka`
  - Password: `Password123!`
- **Passenger 3**:
  - Email: `shirin@tesla.dhaka`
  - Password: `Password123!`

---

## 19. Deployment Guide

### Live Cloud Deployment
- **Backend API (Render)**: [https://dhaka-tesla-pool.onrender.com](https://dhaka-tesla-pool.onrender.com)
- **API Health Check**: [https://dhaka-tesla-pool.onrender.com/api/health](https://dhaka-tesla-pool.onrender.com/api/health)
- **Managed Database**: [Neon.tech](https://neon.tech) PostgreSQL 16 (AWS US-East-2)
- **Frontend Web**: [Vercel](https://vercel.com) Edge Deployment

### Recommended Free-Tier Architecture
- **Database**: Free Managed PostgreSQL instance on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
- **Backend API**: Free web service container on [Render](https://render.com) or [Railway](https://railway.app).
- **Frontend Web**: Free edge deployment on [Vercel](https://vercel.com).

### Production Docker Deployment
For VM deployment (DigitalOcean Droplet, AWS EC2, or local evaluation server):
```bash
# 1. Clone repository
git clone https://github.com/Maharab2134/dhaka-tesla-pool.git
cd dhaka-tesla-pool

# 2. Configure production secrets in .env
cp .env.example .env
nano .env

# 3. Launch with Docker Compose
docker compose up -d --build

# 4. Verify running services
docker compose ps
curl http://localhost:5000/api/health
```

---

## 20. Known Limitations

1. **Fixed Geo Coordinates**: Distances between Dhaka areas are currently calculated using the Haversine formula based on 9 predefined commercial hub coordinates rather than real-time Google Maps traffic matrices.
2. **Client Polling**: Active ride status and driver seat meters currently refresh via periodic client polling rather than persistent bi-directional WebSockets.
3. **Cash & Mock Tesla Pay**: Payments are automatically created and settled in the database upon trip completion; real bKash/Nagad/SSLCommerz gateway webhooks are not yet connected.

---

## 21. Future Improvements

1. **Real-time WebSockets / Socket.io**: Live driver location telemetry on interactive Mapbox/Leaflet vector maps.
2. **Dynamic Traffic-Aware Corridors**: Integration with OpenStreetMap or Google Distance Matrix API for dynamic congestion-based routing.
3. **Local Payment Gateways**: Integration of Bangladeshi MFS gateways (bKash, Nagad, Rocket) for cashless fare deduction.
4. **Driver Earnings Payout Module**: Automated net payout calculation deducting platform commission.

---

## 22. AI Usage Disclosure

In compliance with project guidelines, AI was utilized as an engineering accelerator:
- **Scaffolding & Boilerplate**: Generation of repetitive Prisma model definitions, Express route controllers, and TypeScript interfaces.
- **Test Case Generation**: Synthesizing edge-case integration tests for concurrency and state machine validation.
- **Documentation**: Drafting structured Markdown and Mermaid diagrams reflecting the actual codebase implementation.
- **Code Review**: Auditing concurrency locking logic and integer arithmetic bounds.

*Every line of code and architectural decision was reviewed, validated, and tested by the engineer prior to commit.*

---

## 23. Final Demo Scenario Walkthrough

> 💡 **Video Walkthrough**: Watch this complete 8-step workflow demonstrated in the **[Project Walkthrough Video (Google Drive)](https://drive.google.com/file/d/1JsHdWH--jeZjJDafSt56gyqeA0noKc3Z/view?usp=drive_link)**.

Follow this scripted 8-step walkthrough to evaluate the complete end-to-end pooling workflow:

```text
Step 1: Driver Availability
  1. Open http://localhost:3000/login
  2. Click "Driver: Jashim" (1-click login)
  3. On the Driver Cockpit, toggle availability to "ONLINE"
  4. Notice the Seat Meter displays "0 / 3 seats occupied"

Step 2: Passenger 1 (Nusrat) Requests Ride
  1. Open an incognito browser window at http://localhost:3000/login
  2. Click "Passenger: Nusrat"
  3. Select Pickup: "Banani", Destination: "Mohakhali", Seats: 1
  4. Note the estimated fare: ৳105.00 (Base ৳60 + 3km distance ৳60 - 25% pool discount ৳15)
  5. Click "Request Tesla Pool"
  6. Nusrat's status updates to MATCHED to Jashim's pool

Step 3: Passenger 2 (Rafiq) Pools In
  1. Open a second browser session at http://localhost:3000/login
  2. Click "Passenger: Rafiq"
  3. Select Pickup: "Banani", Destination: "Gulshan 1", Seats: 1
  4. Click "Request Tesla Pool"
  5. System detects compatible corridor (<2km pickup difference) and pools Rafiq with Nusrat!

Step 4: Driver Cockpit Observes Shared Pool
  1. Switch to Jashim's cockpit tab
  2. Seat Meter automatically updates to "2 / 3 seats occupied"
  3. Active Roster displays both Nusrat and Rafiq with their pickup locations

Step 5: Driver Arrival
  1. Jashim clicks "Mark Arrived"
  2. Status advances to DRIVER_ARRIVED on both Nusrat's and Rafiq's timelines

Step 6: Trip Start
  1. Jashim clicks "Start Trip"
  2. Status advances to STARTED on all active passenger timelines

Step 7: Trip Completion & Fare Settlement
  1. Jashim clicks "Complete Trip"
  2. Status advances to COMPLETED
  3. System automatically records settled Payment records for both passengers
  4. Jashim's seat meter resets to 0 / 3 available

Step 8: History & Verification
  1. Switch to Nusrat's tab and visit "Ride History" (/passenger/history)
  2. Verify the completed trip is listed with exact fare paid (৳105.00)
  3. Switch to Rafiq's tab and verify his separate ride record with his own individual fare
```
