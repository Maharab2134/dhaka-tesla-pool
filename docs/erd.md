# Dhaka Tesla Pool — Entity Relationship Diagram (ERD)

> *"Share a seat. Split the fare. Survive Dhaka traffic."*

This document outlines the complete relational data model for the Dhaka Tesla Pool system, matching the active Prisma schema (`backend/prisma/schema.prisma`).

---

## 1. Visual Entity Relationship Diagram

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
        string id PK "cuid()"
        string name "User full name"
        string email UK "Unique email address"
        string password_hash "Bcrypt hash (cost 10)"
        UserRole role "PASSENGER | DRIVER"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    vehicles {
        string id PK "cuid()"
        string driver_id FK,UK "References users(id)"
        string name "e.g. Bullet"
        int capacity "Seat capacity (default: 3)"
        boolean is_online "Driver availability toggle"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    ride_requests {
        string id PK "cuid()"
        string passenger_id FK "References users(id)"
        string pickup_area "e.g. Banani"
        string destination_area "e.g. Mohakhali"
        float pickup_lat "Latitude coordinate"
        float pickup_lng "Longitude coordinate"
        float destination_lat "Latitude coordinate"
        float destination_lng "Longitude coordinate"
        int seats_requested "Seats required (default: 1)"
        RideRequestStatus status "REQUESTED | MATCHED | DRIVER_ARRIVED | STARTED | COMPLETED | CANCELLED"
        int estimated_fare_poisha "Estimated fare in poisha"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    pools {
        string id PK "cuid()"
        string vehicle_id FK "References vehicles(id)"
        PoolStatus status "OPEN | FULL | ACTIVE | COMPLETED | CANCELLED"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    pool_members {
        string id PK "cuid()"
        string pool_id FK "References pools(id)"
        string ride_request_id FK,UK "References ride_requests(id)"
        string passenger_id FK "References users(id)"
        int seats "Seats claimed (default: 1)"
        int fare_poisha "Individual fare in poisha"
        datetime joined_at "Timestamp"
    }

    ride_status_history {
        string id PK "cuid()"
        string ride_request_id FK "References ride_requests(id)"
        RideRequestStatus from_status "Previous state"
        RideRequestStatus to_status "New state"
        string changed_by "Actor ID (system/passenger/driver)"
        datetime created_at "Timestamp"
    }

    fares {
        string id PK "cuid()"
        string ride_request_id FK,UK "References ride_requests(id)"
        int base_fare_poisha "Flat flag drop (6000 = ৳60.00)"
        int distance_charge_poisha "Distance fare (2000/km = ৳20/km)"
        int pool_discount_poisha "Pool discount (25% if pooled)"
        int final_fare_poisha "Gross fare - discount"
        datetime created_at "Timestamp"
    }

    payments {
        string id PK "cuid()"
        string ride_request_id FK "References ride_requests(id)"
        string passenger_id FK "References users(id)"
        int amount_poisha "Amount settled in poisha"
        PaymentMethod method "CASH | TESLA_PAY"
        PaymentStatus status "PENDING | PAID"
        datetime created_at "Timestamp"
    }
```

---

## 2. Enums Definition

| Enum Name | Values | Description |
| :--- | :--- | :--- |
| **`UserRole`** | `PASSENGER`, `DRIVER` | Role-based access control guard. |
| **`RideRequestStatus`** | `REQUESTED`, `MATCHED`, `DRIVER_ARRIVED`, `STARTED`, `COMPLETED`, `CANCELLED` | Finite State Machine ride states. |
| **`PoolStatus`** | `OPEN`, `FULL`, `ACTIVE`, `COMPLETED`, `CANCELLED` | Lifecycle of a pooled vehicle trip. |
| **`PaymentMethod`** | `CASH`, `TESLA_PAY` | Accepted payment methods in Dhaka. |
| **`PaymentStatus`** | `PENDING`, `PAID` | Settlement status upon trip completion. |

---

## 3. Relational Invariants & Business Constraints

1. **Integer Poisha Financial Precision**:
   - `estimated_fare_poisha`, `base_fare_poisha`, `distance_charge_poisha`, `pool_discount_poisha`, `final_fare_poisha`, and `amount_poisha` are stored as integers representing poisha (৳1.00 = 100 poisha). No floating-point math is used.
2. **Hard Vehicle Capacity Constraint**:
   - Vehicle "Bullet" is seeded with `capacity = 3`.
   - The sum of `seats` across all active `pool_members` for a given `pool_id` must **never exceed** `vehicle.capacity`.
   - Enforced by pessimistic locking (`SELECT id FROM pools WHERE id = $1 FOR UPDATE`) within Prisma transactions.
3. **One Active Pool Membership Per Ride**:
   - `pool_members.ride_request_id` has a unique constraint (`@unique`), guaranteeing that a single ride request cannot be duplicated across multiple pools.
4. **Audit Trail Immutability**:
   - `ride_status_history` is an append-only table recording every state transition along with the triggering actor (`changed_by`).
5. **Cross-Passenger Privacy**:
   - Queries for `RideRequest`, `Fare`, and `Payment` are strictly filtered by `passengerId` so passengers can never inspect each other's fares or destinations.
