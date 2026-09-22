# Dhaka Tesla Pool --- Complete Implementation Plan

> **Purpose:** This document converts the provided internship PRD into a
> practical, step-by-step implementation roadmap. Follow the phases in
> order instead of building the whole system at once.

------------------------------------------------------------------------

## 1. Project Goal

Build an MVP for **Dhaka Tesla Pool** where:

-   Passengers can register/login and request rides.
-   Drivers can register/login, own a Tesla/vehicle, and go
    online/offline.
-   Multiple compatible passengers can share one vehicle.
-   Vehicle capacity can never be exceeded.
-   Each passenger receives an individual fare.
-   Ride status follows a clear lifecycle.
-   Users can view ride history.
-   The system is backed by a relational database.
-   The application runs with Docker Compose.
-   Important business rules are tested.
-   Architecture, ERD, Git history, README, deployment, and demo video
    are included.

The PRD explicitly says real routing/map integration is not required. A
predefined list of Dhaka areas or simple coordinates is sufficient.

------------------------------------------------------------------------

# 2. Recommended Technology Stack

## Frontend

-   Next.js
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   React Hook Form
-   Zod

## Backend

-   Node.js
-   Express
-   TypeScript
-   JWT authentication
-   Zod validation

## Database

-   PostgreSQL
-   Prisma ORM

## Testing

-   Vitest
-   Supertest

## Infrastructure

-   Docker
-   Docker Compose

## Documentation

-   Markdown README
-   Mermaid architecture diagram
-   Mermaid ERD

------------------------------------------------------------------------

# 3. High-Level Architecture

``` text
Browser
   |
   v
Next.js Frontend
   |
   | REST API
   v
Express + TypeScript API
   |
   v
Prisma ORM
   |
   v
PostgreSQL
```

Keep the architecture simple. Do not add microservices, Kafka,
Kubernetes, Redis, or queues unless there is a real engineering reason.

------------------------------------------------------------------------

# 4. Repository Structure

``` text
dhaka-tesla-pool/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   └── types/
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── rides/
│   │   │   ├── pools/
│   │   │   ├── drivers/
│   │   │   └── fares/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       └── seed.ts
│
├── docs/
│   ├── architecture.md
│   └── erd.md
│
├── docker-compose.yml
├── .env.example
├── README.md
└── LICENSE
```

------------------------------------------------------------------------

# 5. Phase 1 --- Project Initialization

## Tasks

-   Create GitHub repository.
-   Create `master` branch.
-   Create `pre-release` branch.
-   Create feature branches as development progresses.
-   Initialize frontend.
-   Initialize backend.
-   Initialize Docker Compose.
-   Create `.env.example`.
-   Create initial README.
-   Add ESLint/Prettier if desired.
-   Make the first small commits.

## Initial branches

``` text
master
pre-release
```

First feature branch:

``` text
feature/project-setup
```

## Example commits

``` text
chore(repo): initialize project structure
build(frontend): initialize nextjs application
build(backend): initialize express api
build(docker): add docker compose configuration
docs(readme): add project overview
```

------------------------------------------------------------------------

# 6. Phase 2 --- Database Design

Design the database before implementing the business logic.

## Core tables

``` text
users
vehicles
ride_requests
pools
pool_members
ride_status_history
fares
payments
```

## Users

``` text
id
name
email
password_hash
role
created_at
updated_at
```

Roles:

``` text
PASSENGER
DRIVER
```

## Vehicles

``` text
id
driver_id
name
capacity
is_online
created_at
updated_at
```

Example:

``` text
Driver: Jashim
Vehicle: Bullet
Capacity: 3
```

## Ride Requests

``` text
id
passenger_id
pickup_area
destination_area
pickup_lat
pickup_lng
destination_lat
destination_lng
seats_requested
status
estimated_fare
created_at
updated_at
```

## Pools

``` text
id
vehicle_id
status
created_at
updated_at
```

## Pool Members

``` text
id
pool_id
ride_request_id
passenger_id
seats
fare
joined_at
```

## Ride Status History

``` text
id
ride_request_id
from_status
to_status
changed_by
created_at
```

## Fares

``` text
id
ride_request_id
base_fare
distance_charge
pool_discount
final_fare
created_at
```

## Payments

``` text
id
ride_request_id
passenger_id
amount
method
status
created_at
```

Payment can initially be:

``` text
CASH
TESLA_PAY
```

No real payment gateway is necessary.

------------------------------------------------------------------------

# 7. Phase 3 --- Database Relationships

Main relationships:

``` text
User
 |
 +---- Passenger ----> RideRequest
 |
 +---- Driver -------> Vehicle
                         |
                         v
                       Pool
                         |
                         v
                    PoolMember
                         |
                         v
                    RideRequest
```

Important constraints:

1.  A driver can own a vehicle.
2.  A vehicle has a fixed capacity.
3.  A passenger owns their ride request.
4.  A pool belongs to a vehicle.
5.  A pool has multiple pool members.
6.  A ride request can belong to a pool.
7.  A passenger must not access another passenger's private ride
    information.
8.  Pool occupancy must never exceed vehicle capacity.

------------------------------------------------------------------------

# 8. Phase 4 --- Seed Data

Use the PRD story consistently.

## Driver

``` text
Jashim
```

## Vehicle

``` text
Bullet
Capacity: 3
```

## Passengers

``` text
Nusrat
Rafiq
Shirin
```

## Example trips

``` text
Nusrat:
Banani -> Mohakhali

Rafiq:
Banani -> Gulshan 1

Shirin:
Banani -> Gulshan 1
```

Use these names consistently in:

-   Seed data
-   Tests
-   Demo
-   README
-   Video

Do not replace them with generic `user1`, `driver1`, etc.

------------------------------------------------------------------------

# 9. Phase 5 --- Authentication

Implement:

``` text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Registration

Support:

``` text
Passenger registration
Driver registration
```

## Login

Return:

``` text
JWT token
user information
role
```

## Middleware

Create:

``` text
authenticate
requirePassenger
requireDriver
```

Example:

``` text
POST /api/rides
        |
        v
authenticate
        |
        v
requirePassenger
        |
        v
create ride
```

------------------------------------------------------------------------

# 10. Phase 6 --- Passenger Ride Request

Passenger dashboard should contain:

``` text
Pickup
Destination
Seats
Estimated Fare
Request Ride
```

Example:

``` text
Pickup: Banani
Destination: Mohakhali
Seats: 1
```

API:

``` text
POST /api/rides
```

Backend should:

1.  Authenticate passenger.
2.  Validate input.
3.  Check allowed areas.
4.  Calculate estimated fare.
5.  Find compatible pool.
6.  Check available capacity.
7.  Add passenger to pool if compatible.
8.  Otherwise create a waiting ride.
9.  Return ride details.

------------------------------------------------------------------------

# 11. Phase 7 --- Geography

Do not build Google Maps.

Create a predefined area list:

``` text
Banani
Gulshan
Mohakhali
Dhanmondi
Mirpur
Uttara
Farmgate
Bashundhara
```

Optional coordinates:

``` text
area
latitude
longitude
```

Use a simple matching rule.

Example:

``` text
Same pickup zone
+
Compatible destination
+
Available seats
=
Pool candidate
```

Document the exact rule in README.

------------------------------------------------------------------------

# 12. Phase 8 --- Fare Calculation

Use a simple and testable model.

``` text
passengerFare =
baseFare
+ distanceCharge
- poolDiscount
```

Example:

``` text
Base Fare       = 60
Distance Charge = 80
Pool Discount   = 30
---------------------
Final Fare      = 110
```

Store money consistently.

Recommended approach:

``` text
integer paisa/poisha
```

For example:

``` text
৳110.00
=
11000 poisha
```

This avoids floating-point money problems.

------------------------------------------------------------------------

# 13. Phase 9 --- Pool Matching

This is the core business logic.

Example:

``` text
Nusrat
Banani -> Mohakhali
        |
        v
Rafiq
Banani -> Gulshan 1
```

Matching process:

``` text
New Ride Request
       |
       v
Find active pools
       |
       v
Check pickup compatibility
       |
       v
Check route compatibility
       |
       v
Check available seats
       |
   +---+---+
   |       |
  YES      NO
   |       |
   v       v
Join     Waiting
Pool      Ride
```

------------------------------------------------------------------------

# 14. Phase 10 --- Capacity Enforcement

Vehicle:

``` text
Bullet
Capacity = 3
```

Members:

``` text
Nusrat = 1
Rafiq  = 1
Shirin = 1
```

Total:

``` text
3 / 3
```

No fourth passenger can join.

Never allow:

``` text
4 / 3
```

This must be enforced by backend/database logic, not only frontend
validation.

------------------------------------------------------------------------

# 15. Phase 11 --- Concurrency Handling

Important scenario:

``` text
Bullet has 1 seat left.

Nusrat requests the last seat.
Shirin requests the last seat.
```

Both requests may initially see:

``` text
availableSeats = 1
```

The backend must ensure only one succeeds.

Use a database transaction.

Concept:

``` text
BEGIN TRANSACTION

Check available capacity

If capacity available:
    create pool membership
    update occupancy

Commit
```

If no capacity remains:

``` text
Reject request
```

Document what happens during concurrent requests.

------------------------------------------------------------------------

# 16. Phase 12 --- Ride Lifecycle

Main lifecycle:

``` text
REQUESTED
    |
    v
MATCHED / ACCEPTED
    |
    v
DRIVER_ARRIVED
    |
    v
STARTED
    |
    v
COMPLETED
```

Alternative:

``` text
REQUESTED
    |
    v
CANCELLED
```

Only valid transitions should be allowed.

Example:

``` text
REQUESTED -> MATCHED        YES
MATCHED -> DRIVER_ARRIVED  YES
DRIVER_ARRIVED -> STARTED  YES
STARTED -> COMPLETED       YES

COMPLETED -> STARTED        NO
COMPLETED -> MATCHED        NO
```

Create a centralized state transition function.

------------------------------------------------------------------------

# 17. Phase 13 --- Driver Flow

Driver dashboard:

``` text
Online / Offline
Current Vehicle
Available Requests
Current Pool
Passengers
Seat Usage
Ride Status
Ride History
```

Driver APIs:

``` text
PATCH /api/driver/online
GET   /api/driver/requests
POST  /api/driver/rides/:id/accept
POST  /api/driver/rides/:id/arrive
POST  /api/driver/rides/:id/start
POST  /api/driver/rides/:id/complete
```

Driver should only see relevant requests/pools.

------------------------------------------------------------------------

# 18. Phase 14 --- Passenger UI

Pages:

``` text
/login
/register
/passenger
/passenger/rides
/passenger/rides/:id
/passenger/history
```

Dashboard:

``` text
Where are you going?

[ Pickup ]

[ Destination ]

[ Seats ]

Estimated Fare

[ Request Shared Ride ]
```

Ride details:

``` text
Pickup
Destination
Fare
Pool status
Driver
Vehicle
Current status
Other relevant pool information
```

Do not expose another passenger's private fare.

------------------------------------------------------------------------

# 19. Phase 15 --- Driver UI

Pages:

``` text
/driver
/driver/requests
/driver/current-ride
/driver/history
```

Dashboard should show:

``` text
Jashim
Bullet
3 seats

ONLINE

Current Pool
----------------
Nusrat
Rafiq
Shirin

Seats:
3 / 3

[ Start Ride ]
```

------------------------------------------------------------------------

# 20. Phase 16 --- Ride Status UI

Use a visual timeline:

``` text
✓ Ride Requested

✓ Driver Matched

✓ Driver Arrived

● Ride Started

○ Completed
```

For cancelled rides:

``` text
Ride Requested
      |
      v
Cancelled
```

Make the status visually clear but do not spend excessive time on
animation.

------------------------------------------------------------------------

# 21. Phase 17 --- Ride History

Passenger:

``` text
My Ride History
```

Driver:

``` text
My Driving History
```

Show:

``` text
Date
Pickup
Destination
Fare
Status
Pool
Vehicle
```

Keep enough history to explain what happened later.

------------------------------------------------------------------------

# 22. Phase 18 --- Authorization & Security

Implement:

-   Password hashing.
-   JWT authentication.
-   Role authorization.
-   Input validation.
-   Ownership checks.
-   Safe error messages.
-   No secrets in Git.
-   `.env.example` only.
-   API validation on backend.

Important:

``` text
Passenger A
    X
Passenger B's ride
```

A passenger must not modify or access another user's private ride.

------------------------------------------------------------------------

# 23. Phase 19 --- API Error Handling

Use consistent responses.

Success:

``` json
{
  "success": true,
  "data": {}
}
```

Error:

``` json
{
  "success": false,
  "error": {
    "code": "POOL_FULL",
    "message": "No seats are available."
  }
}
```

Handle:

``` text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

------------------------------------------------------------------------

# 24. Phase 20 --- Testing

Focus on business-critical tests.

## Capacity test

``` text
capacity = 3
members = 3

Expected:
new passenger cannot join
```

## Invalid transition test

``` text
COMPLETED -> STARTED

Expected:
rejected
```

## Fare test

``` text
Base + Distance - Discount

Expected:
exact calculated amount
```

## Ownership test

``` text
Passenger A
tries to modify
Passenger B's ride

Expected:
403
```

## Cancellation test

Test valid and invalid cancellation windows.

## Concurrency test

Two users claim the last seat.

Expected:

``` text
One succeeds
One fails
Capacity remains correct
```

------------------------------------------------------------------------

# 25. Phase 21 --- Docker

Required command:

``` bash
docker compose up
```

Services:

``` text
frontend
backend
postgres
```

Include:

``` text
.env.example
database migration
seed data
health checks if practical
```

Test the application from a clean environment.

------------------------------------------------------------------------

# 26. Phase 22 --- Documentation

README must contain:

``` text
Project Summary
Problem Statement
Features
Architecture
Architecture Diagram
ERD
Tech Stack
Why Each Technology Was Chosen
Project Structure
Prerequisites
Environment Variables
Local Setup
Docker Setup
Migration
Seed
API Overview
Testing
Demo Credentials
Deployment
Known Limitations
Future Improvements
AI Usage
Demo Video
```

For every non-mandated technology explain:

``` text
What did we choose?
What alternatives exist?
Why did we choose it?
When would we switch?
```

------------------------------------------------------------------------

# 27. Phase 23 --- Architecture Diagram

Add a Mermaid diagram.

Example:

``` mermaid
flowchart TD
    Browser --> NextJS
    NextJS --> ExpressAPI
    ExpressAPI --> Prisma
    Prisma --> PostgreSQL
```

------------------------------------------------------------------------

# 28. Phase 24 --- ERD

Create an ERD showing:

``` text
User
 |
 +-- Vehicle
 |
 +-- RideRequest
       |
       +-- PoolMember
       |
       +-- Fare
       |
       +-- Payment
       |
       +-- RideStatusHistory

Vehicle
 |
 +-- Pool
       |
       +-- PoolMember
```

Make sure the actual implementation matches the documented ERD.

------------------------------------------------------------------------

# 29. Phase 25 --- Git Workflow

Do not make one giant final commit.

Use:

``` text
feature/project-setup
feature/database-schema
feature/auth
feature/passenger-flow
feature/driver-flow
feature/ride-lifecycle
feature/tesla-pooling
feature/fare-calculation
feature/concurrency
feature/testing
feature/docker
feature/deployment
```

Example:

``` text
feat(auth): add passenger login endpoint
feat(pool): enforce Bullet seat capacity
feat(ride): add ride lifecycle
feat(fare): calculate pooled passenger fare
fix(pool): prevent overbooking available seats
test(pool): add concurrent seat claim test
build(docker): add compose setup
docs(readme): document architecture decisions
```

------------------------------------------------------------------------

# 30. Phase 26 --- UI Polish

After business logic works, improve:

-   Responsive layout.
-   Loading states.
-   Empty states.
-   Error states.
-   Toast notifications.
-   Form validation.
-   Status badges.
-   Fare cards.
-   Seat indicators.
-   Ride timeline.
-   Driver/vehicle cards.
-   Mobile layout.

Do not prioritize animations over data integrity.

------------------------------------------------------------------------

# 31. Phase 27 --- Deployment

Target:

``` text
Frontend -> Free hosting
Backend  -> Free/free-tier hosting
Database -> Free PostgreSQL
```

If free backend hosting is not available, provide a reproducible Docker
deployment.

Never pay for infrastructure for this challenge.

------------------------------------------------------------------------

# 32. Phase 28 --- Final Demo Scenario

Use one complete story.

## Step 1

Login as Nusrat.

``` text
Banani -> Mohakhali
1 seat
```

Request ride.

## Step 2

Login/request as Rafiq.

``` text
Banani -> Gulshan 1
1 seat
```

System finds a compatible pool.

## Step 3

Login as Jashim.

``` text
Bullet
Capacity: 3
```

Driver sees relevant pool.

## Step 4

Driver accepts.

``` text
MATCHED
```

## Step 5

Driver arrives.

``` text
DRIVER_ARRIVED
```

## Step 6

Driver starts.

``` text
STARTED
```

## Step 7

Driver completes.

``` text
COMPLETED
```

## Step 8

Show:

``` text
Passenger fares
Ride history
Pool membership
Vehicle capacity
Status history
```

------------------------------------------------------------------------

# 33. Six-Minute Video Structure

## 0:00--1:00 --- Problem

Explain:

-   Dhaka traffic.
-   Shared seats.
-   Pooling problem.
-   Three actors.
-   Main idea.

Do not read the PRD word-for-word.

## 1:00--3:00 --- Engineering

Show:

-   Architecture.
-   Database.
-   Pool logic.
-   Fare calculation.
-   Capacity enforcement.
-   One important engineering decision.
-   One trade-off.

## 3:00--6:00 --- Product Demo

Show:

-   Passenger request.
-   Pool matching.
-   Driver dashboard.
-   Shared Tesla.
-   Fare.
-   Status lifecycle.
-   Edge case.
-   Deployment if available.

------------------------------------------------------------------------

# 34. Final Submission Checklist

Before submission:

-   [ ] Working frontend
-   [ ] Working backend
-   [ ] Working database
-   [ ] Authentication
-   [ ] Passenger flow
-   [ ] Driver flow
-   [ ] Pool matching
-   [ ] Capacity enforcement
-   [ ] Individual fare
-   [ ] Ride lifecycle
-   [ ] Cancellation
-   [ ] Ride history
-   [ ] Authorization
-   [ ] Concurrency handling
-   [ ] Tests
-   [ ] Docker Compose
-   [ ] `.env.example`
-   [ ] Migrations
-   [ ] Seed data
-   [ ] Architecture diagram
-   [ ] ERD
-   [ ] README
-   [ ] AI Usage section
-   [ ] Meaningful Git history
-   [ ] Deployment
-   [ ] Six-minute demo video

------------------------------------------------------------------------

# 35. Recommended Build Order

Follow this exact order:

``` text
1. Repository
       ↓
2. Frontend + Backend setup
       ↓
3. Docker
       ↓
4. PostgreSQL
       ↓
5. Prisma schema
       ↓
6. Seed data
       ↓
7. Authentication
       ↓
8. Passenger ride request
       ↓
9. Fare calculation
       ↓
10. Driver flow
       ↓
11. Pool matching
       ↓
12. Capacity enforcement
       ↓
13. Ride lifecycle
       ↓
14. History
       ↓
15. Authorization/security
       ↓
16. Concurrency
       ↓
17. Tests
       ↓
18. UI polish
       ↓
19. Deployment
       ↓
20. README + ERD + Architecture
       ↓
21. Demo video
       ↓
22. Final audit
```

------------------------------------------------------------------------

# 36. How We Should Work on This Project

Do **not** ask AI to generate the entire project in one giant prompt.

Instead, build it in small milestones.

For every milestone:

``` text
PLAN
  ↓
IMPLEMENT
  ↓
RUN
  ↓
TEST
  ↓
FIX
  ↓
COMMIT
```

After each milestone, verify that the existing functionality still
works.

------------------------------------------------------------------------

# 37. AI Usage Rule

AI can be used for:

-   Planning.
-   Boilerplate.
-   Debugging.
-   Test generation.
-   Documentation.
-   Code review.
-   Architecture discussion.

But every generated part must be understood before submission.

Be able to explain:

``` text
Why is this table needed?
Why is this API structured this way?
Why is this state transition valid?
How is capacity protected?
How does authentication work?
How does concurrent booking work?
What happens when something fails?
How would this scale later?
```

------------------------------------------------------------------------

# 38. Definition of Done

The project is considered complete only when:

``` text
User can register
       ↓
User can login
       ↓
Passenger can request ride
       ↓
Fare is calculated
       ↓
Compatible requests can pool
       ↓
Capacity cannot be exceeded
       ↓
Driver can accept
       ↓
Driver can arrive
       ↓
Driver can start
       ↓
Driver can complete
       ↓
Passenger sees own fare
       ↓
History is stored
       ↓
Important rules are tested
       ↓
Docker can run the project
       ↓
README explains the system
       ↓
Git history shows real development
       ↓
Demo video proves the workflow
```

------------------------------------------------------------------------

# 39. Final Principle

The goal is not to create the largest application.

The goal is to demonstrate:

``` text
Understand
   ↓
Design
   ↓
Build
   ↓
Commit
   ↓
Test
   ↓
Ship
   ↓
Explain
   ↓
Debug
   ↓
Change
```

A small, clean, reliable MVP is more valuable than a large system with
broken business logic.

------------------------------------------------------------------------

## Source

Implementation plan based on the provided **Dhaka Tesla Pool Internship
PRD**.
