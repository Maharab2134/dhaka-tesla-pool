# Dhaka Tesla Pool — System Architecture

> *"Share a seat. Split the fare. Survive Dhaka traffic."*

This document provides detailed architectural specifications and Mermaid diagrams for the Dhaka Tesla Pool system.

---

## 1. High-Level System Architecture

The application is structured as a clean, production-minded modular monolith designed for predictable latency, strong concurrency control, and rapid local evaluation.

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        P_UI["Passenger Web UI<br/>(Next.js 15 • App Router • Tailwind CSS)"]
        D_UI["Driver Cockpit UI<br/>(Next.js 15 • Live Seat Meter • Stepped Controls)"]
    end

    subgraph Gateway["API & Security Layer"]
        API_GATE["Express 4 REST API Server (Port 5000)"]
        AUTH_MID["JWT Auth Middleware (authenticate)"]
        RBAC_MID["Role Guard Middleware (requirePassenger / requireDriver)"]
        ZOD_VAL["Zod Request Validation Schemas"]
    end

    subgraph Modules["Application Business Logic"]
        AUTH_MOD["Auth Module<br/>(Bcrypt Hashing • 7d Signed JWT)"]
        RIDES_MOD["Rides & Fare Module<br/>(Integer Poisha Pricing • Ownership Privacy)"]
        POOLS_MOD["Pooling Engine<br/>(Corridor Matching • Capacity Enforcement)"]
        DRIVERS_MOD["Driver & Lifecycle Module<br/>(FSM Transitions • Auto Payment Settlement)"]
    end

    subgraph Data["Persistence & Concurrency Layer"]
        PRISMA["Prisma ORM Client 6.x"]
        LOCK["PostgreSQL Row-Level Pessimistic Lock<br/>(SELECT ... FOR UPDATE)"]
        POSTGRES[("PostgreSQL 16 Engine<br/>ACID Transactions • Relational Constraints")]
    end

    P_UI -->|HTTP / JSON + Bearer Token| API_GATE
    D_UI -->|HTTP / JSON + Bearer Token| API_GATE

    API_GATE --> AUTH_MID
    AUTH_MID --> RBAC_MID
    RBAC_MID --> ZOD_VAL

    ZOD_VAL --> AUTH_MOD
    ZOD_VAL --> RIDES_MOD
    ZOD_VAL --> POOLS_MOD
    ZOD_VAL --> DRIVERS_MOD

    RIDES_MOD --> PRISMA
    POOLS_MOD --> PRISMA
    DRIVERS_MOD --> PRISMA
    AUTH_MOD --> PRISMA

    PRISMA --> LOCK
    LOCK --> POSTGRES
```

---

## 2. Ride Lifecycle Finite State Machine (FSM)

The ride lifecycle is governed by an explicit Finite State Machine enforced at the database transaction layer. Any illegal state transition is strictly rejected with HTTP 400 (`INVALID_STATUS_TRANSITION`), preventing data corruption.

```mermaid
stateDiagram-v2
    [*] --> REQUESTED: Passenger requests ride

    REQUESTED --> MATCHED: Auto-matched to active Pool / Driver accepts request
    REQUESTED --> CANCELLED: Passenger cancels while waiting

    MATCHED --> DRIVER_ARRIVED: Driver marks arrival at pickup
    MATCHED --> CANCELLED: Passenger cancels (Seats released from Pool)

    DRIVER_ARRIVED --> STARTED: Driver starts trip with onboard passengers
    DRIVER_ARRIVED --> CANCELLED: Passenger cancels before trip start

    STARTED --> COMPLETED: Driver completes trip (Fare finalized, Payment auto-generated)

    COMPLETED --> [*]
    CANCELLED --> [*]

    note right of REQUESTED: Base fare: ৳60.00\nDistance: ৳20.00/km\nPool discount: 25% (if pooled)
    note right of COMPLETED: Automatic Payment record:\nStatus: COMPLETED\nAmount: exact integer poisha
    note right of CANCELLED: Cancellation window:\nAllowed during REQUESTED, MATCHED, DRIVER_ARRIVED\nForbidden during STARTED or COMPLETED
```

### Transition Validation Table

| Current Status | Target Status | Permitted Actor | Side Effects & Invariants |
| :--- | :--- | :--- | :--- |
| **`REQUESTED`** | `MATCHED` | System / Driver | Linked to `Pool` via `PoolMember`; seat reservation incremented. |
| **`REQUESTED`** | `CANCELLED` | Passenger | Ride terminated; status history recorded. |
| **`MATCHED`** | `DRIVER_ARRIVED` | Driver | Status history recorded; passenger UI notified. |
| **`MATCHED`** | `CANCELLED` | Passenger | Seat allocation removed from Pool; remaining pool members retain trip. |
| **`DRIVER_ARRIVED`** | `STARTED` | Driver | Pool status changes to `ACTIVE`; vehicle occupied. |
| **`DRIVER_ARRIVED`** | `CANCELLED` | Passenger | Seat released; cancellation logged. |
| **`STARTED`** | `COMPLETED` | Driver | Pool status changes to `COMPLETED`; vehicle released; `Payment` record created. |
| *Any other* | *Any other* | None | **Rejected with HTTP 400 (`INVALID_STATUS_TRANSITION`)**. |

---

## 3. Concurrency & Seat Locking Architecture

The vehicle "Bullet" driven by Jashim has an absolute hard limit of **3 passenger seats**. When multiple passengers concurrently request rides that match the same pool corridor, a race condition could overbook the vehicle without locking.

To guarantee zero overbooking under high concurrency, the pooling engine executes a **PostgreSQL Row-Level Pessimistic Lock** inside an isolated Prisma transaction.

```mermaid
sequenceDiagram
    autonumber
    actor PassengerA as Passenger A (Nusrat)
    actor PassengerB as Passenger B (Rafiq)
    participant Engine as Pooling Engine (RidesService)
    participant DB as PostgreSQL (Pools Table)

    Note over PassengerA,PassengerB: Pool currently has 2/3 seats occupied (1 seat remaining)

    par Concurrent Seat Claim
        PassengerA->>Engine: POST /api/rides (Banani -> Mohakhali, 1 seat)
        PassengerB->>Engine: POST /api/rides (Banani -> Gulshan 1, 1 seat)
    end

    Note over Engine,DB: Transaction A begins first by microseconds
    Engine->>DB: BEGIN TX A
    Engine->>DB: SELECT id FROM pools WHERE id = 1 FOR UPDATE
    DB-->>Engine: TX A acquires exclusive row lock on Pool 1

    Note over Engine,DB: Transaction B attempts to read Pool 1
    Engine->>DB: BEGIN TX B
    Engine->>DB: SELECT id FROM pools WHERE id = 1 FOR UPDATE
    Note over DB: TX B is blocked by Postgres lock manager waiting for TX A

    Note over Engine: TX A verifies capacity: 2 + 1 <= 3 (Valid!)
    Engine->>DB: INSERT INTO pool_members (seatCount: 1)
    Engine->>DB: UPDATE ride_requests SET status = 'MATCHED'
    Engine->>DB: COMMIT TX A
    DB-->>PassengerA: HTTP 201 Created (MATCHED to Pool 1, 3/3 full)

    Note over DB: Row lock released. TX B acquires row lock now.
    Note over Engine: TX B queries current seat count: 3 occupied!
    Note over Engine: 3 + 1 = 4 > 3 (Capacity Exceeded!)
    Engine->>DB: ROLLBACK TX B
    DB-->>PassengerB: Fallback: Creates new open Pool / status REQUESTED
```

---

## 4. Dhaka Geography & Corridor Matching Engine

Dhaka's north-south transit corridors (Uttara to Motijheel) experience severe bottlenecks. The pooling engine calculates Haversine distance and groups rides whose pickup locations fall within a **2.0 km geographical tolerance**:

```mermaid
flowchart LR
    subgraph North["North Dhaka"]
        UT["Uttara<br/>(23.8759, 90.3795)"]
        MP["Mirpur<br/>(23.8223, 90.3654)"]
    end

    subgraph MidNorth["Mid-North Hubs (Corridor 1)"]
        BN["Banani<br/>(23.7937, 90.4066)"]
        G2["Gulshan 2<br/>(23.7925, 90.4162)"]
    end

    subgraph MidSouth["Mid-South Hubs (Corridor 2)"]
        G1["Gulshan 1<br/>(23.7782, 90.4162)"]
        MK["Mohakhali<br/>(23.7777, 90.4054)"]
    end

    subgraph South["South Dhaka Hubs"]
        FG["Farmgate<br/>(23.7561, 90.3872)"]
        DN["Dhanmondi<br/>(23.7461, 90.3742)"]
        MJ["Motijheel<br/>(23.7330, 90.4172)"]
    end

    UT --> BN
    MP --> MK
    BN <-->|0.98 km &le; 2.0 km<br/>Compatible Corridor| G2
    MK <-->|1.11 km &le; 2.0 km<br/>Compatible Corridor| G1
    BN --> MK
    G1 --> MJ
    MK --> FG
    FG --> DN
    DN --> MJ
```

### Fare Formula & Integer Poisha Accounting

Floating-point representations (e.g. `0.1 + 0.2 = 0.30000000000000004`) lead to cumulative rounding errors in financial transactions. All calculations are executed and stored in integer **poisha** (1 BDT = 100 poisha):

$$\text{Distance Charge} = \text{round}(\text{distanceKm}) \times 2{,}000\text{ poisha (৳20/km)}$$
$$\text{Base Fare} = 6{,}000\text{ poisha (৳60.00)}$$
$$\text{Gross Fare} = \text{Base Fare} + \text{Distance Charge}$$
$$\text{Pool Discount} = \text{round}(\text{Gross Fare} \times 0.25)\quad (\text{if pooled})$$
$$\text{Final Fare} = \text{Gross Fare} - \text{Pool Discount}$$
