# Dhaka Tesla Pool --- Development & Git Rules

## Purpose

Project Name: Dhaka Tesla Pool
Repository: dhaka-tesla-pool
Frontend: dhaka-tesla-pool-web
Backend: dhaka-tesla-pool-api
Database: dhaka_tesla_pool


These rules define how development work should be performed on the Dhaka
Tesla Pool project.

The main goal is to keep the project stable, testable, traceable, and
easy to review while building it feature by feature.

------------------------------------------------------------------------

# 1. Core Development Rule

Never make a large number of changes without testing.

For every meaningful task:

``` text
Understand
   ↓
Implement
   ↓
Test
   ↓
Fix if needed
   ↓
Test again
   ↓
Commit
```

The work should be completed in small, understandable milestones.

------------------------------------------------------------------------

# 2. Important Git Rule --- NEVER PUSH Automatically

## Commit is allowed.

## Push is NOT allowed unless the user explicitly asks.

After completing a task:

``` bash
git status
git diff
git add .
git commit -m "..."
```

Stop after the commit.

Do NOT run:

``` bash
git push
```

unless the user explicitly says something such as:

``` text
push
push this
push to github
push the changes
push the branch
```

The user must remain in control of anything sent to the remote
repository.

------------------------------------------------------------------------

# 3. Every Task Must Be Tested

Whenever a feature, fix, refactor, or configuration change is made:

### Step 1 --- Implement

Make the requested change.

### Step 2 --- Test

Run the appropriate checks.

Examples:

``` bash
npm run lint
npm run typecheck
npm run test
npm run build
```

For backend/API changes, also run relevant API or integration tests.

For database changes, verify:

``` text
migration
seed
database connection
affected API
affected UI
```

### Step 3 --- Fix

If a test fails:

``` text
Read error
   ↓
Identify cause
   ↓
Fix
   ↓
Run test again
```

Do not commit known broken changes unless the user explicitly asks to
commit the current state.

------------------------------------------------------------------------

# 4. Add / Update / Fix Workflow

Every development change should be classified as one of:

``` text
ADD
UPDATE
FIX
REFACTOR
TEST
DOCS
BUILD
```

Examples:

### ADD

``` text
Add passenger ride request API.
Add driver dashboard.
Add pool matching logic.
Add fare calculation.
```

### UPDATE

``` text
Update ride status UI.
Update fare calculation rules.
Update database schema.
Update README.
```

### FIX

``` text
Fix pool overbooking.
Fix authentication error.
Fix invalid ride transition.
Fix frontend loading state.
```

### REFACTOR

``` text
Refactor pool service.
Refactor authentication middleware.
Refactor database access.
```

### TEST

``` text
Add pool capacity tests.
Add fare calculation tests.
Add ride lifecycle tests.
```

------------------------------------------------------------------------

# 5. Commit After Each Logical Change

One commit should represent one understandable logical change.

Good:

``` text
feat(auth): add passenger login endpoint

feat(ride): add passenger ride request

feat(pool): add pool matching logic

fix(pool): prevent overbooking available seats

test(pool): add capacity enforcement tests

feat(driver): add ride lifecycle controls

docs(readme): document pool matching rules
```

Avoid:

``` text
update
changes
fix
final
latest
working
test
asdf
done
```

Do not create meaningless micro-commits just to increase the commit
count.

------------------------------------------------------------------------

# 6. Commit Rules

Use:

``` text
<type>(<scope>): <short description>
```

Allowed types:

``` text
feat
fix
refactor
test
docs
chore
build
```

Examples:

``` text
feat(auth): add JWT authentication

feat(ride): create ride request endpoint

feat(pool): match compatible ride requests

fix(pool): prevent capacity overflow

fix(auth): reject expired tokens

test(fare): verify pooled fare calculation

test(ride): validate ride state transitions

refactor(pool): isolate matching service

docs(readme): add local setup instructions

build(docker): add postgres service
```

------------------------------------------------------------------------

# 7. Before Every Commit

Always check:

``` bash
git status
```

Then inspect:

``` bash
git diff
```

For staged changes:

``` bash
git diff --cached
```

Make sure:

-   No secrets are included.
-   No `.env` file with real credentials is committed.
-   No unrelated files are changed.
-   No generated junk is included.
-   The code is formatted.
-   Tests relevant to the change pass.

Then:

``` bash
git add <relevant-files>
git commit -m "..."
```

------------------------------------------------------------------------

# 8. Never Commit Secrets

Never commit:

``` text
.env
API keys
JWT secrets
Database passwords
Tokens
Private credentials
Production secrets
```

Use:

``` text
.env.example
```

Example:

``` env
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_API_URL=
```

Real values remain local.

------------------------------------------------------------------------

# 9. Branch Rules

Use the project branch workflow:

``` text
master
pre-release
release/v1.0.0
```

Feature development should happen on feature branches.

Examples:

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

Do not develop every feature directly on `master`.

------------------------------------------------------------------------

# 10. Feature Branch Workflow

For a new feature:

``` text
Create feature branch
        ↓
Implement small part
        ↓
Test
        ↓
Fix
        ↓
Test again
        ↓
Commit
        ↓
Continue feature
        ↓
Final feature test
        ↓
Stop
```

Do not push automatically.

------------------------------------------------------------------------

# 11. Testing Rules

Testing should focus on important business behavior, not only UI
screenshots.

## Pool Capacity

Example:

``` text
Vehicle capacity = 3

Passenger A = 1
Passenger B = 1
Passenger C = 1

Occupied = 3
Available = 0
```

Another passenger must not be allowed to join.

------------------------------------------------------------------------

## Invalid Ride State

Valid:

``` text
REQUESTED
    ↓
MATCHED
    ↓
DRIVER_ARRIVED
    ↓
STARTED
    ↓
COMPLETED
```

Invalid examples:

``` text
COMPLETED → STARTED
COMPLETED → MATCHED
```

These should be rejected.

------------------------------------------------------------------------

## Fare

Verify:

``` text
baseFare
+ distanceCharge
- poolDiscount
=
finalFare
```

Test multiple passenger fares separately.

------------------------------------------------------------------------

## Authorization

Verify:

``` text
Passenger A
   X
Passenger B's ride
```

A passenger must not modify another passenger's ride.

------------------------------------------------------------------------

## Cancellation

Test:

``` text
Valid cancellation
Invalid cancellation
Already completed ride
Already cancelled ride
```

------------------------------------------------------------------------

## Concurrency

Important scenario:

``` text
1 seat remaining

Nusrat requests
Shirin requests

Both request nearly simultaneously
```

Expected:

``` text
One request succeeds
One request fails
Capacity remains correct
```

------------------------------------------------------------------------

# 12. What to Test After Different Changes

## Frontend UI change

Run at minimum:

``` bash
npm run lint
npm run typecheck
```

If tests exist for the affected component:

``` bash
npm run test
```

------------------------------------------------------------------------

## Backend API change

Run:

``` bash
npm run lint
npm run typecheck
npm run test
```

Also test the affected API manually or with integration tests.

------------------------------------------------------------------------

## Database change

Verify:

``` text
Prisma schema
Migration
Seed
API
Affected tests
```

Recommended:

``` bash
npx prisma validate
npx prisma migrate dev
npm run test
```

------------------------------------------------------------------------

## Authentication change

Test:

``` text
Register
Login
Invalid password
Expired/invalid token
Protected route
Role authorization
```

------------------------------------------------------------------------

## Pool change

Test:

``` text
Matching
Capacity
Joining
Leaving/cancellation if supported
Fare
Concurrent requests
```

------------------------------------------------------------------------

# 13. Do Not Hide Test Failures

If something fails:

``` text
Do not ignore it.
Do not delete the test just to make it pass.
Do not disable the failing check.
Do not commit a knowingly broken implementation.
```

Instead:

``` text
Failure
  ↓
Understand
  ↓
Fix
  ↓
Retest
```

If the correct behavior is intentionally changed, update the test and
document why.

------------------------------------------------------------------------

# 14. Do Not Over-Engineer

Do not add technology just to make the architecture look advanced.

Avoid unnecessary:

``` text
Microservices
Kafka
Kubernetes
Redis
Message queues
Complex real-time infrastructure
```

unless there is a real requirement and the decision can be explained.

Prefer:

``` text
Simple
Clear
Testable
Maintainable
Reliable
```

------------------------------------------------------------------------

# 15. Do Not Polish UI Before Core Logic Works

Priority:

``` text
Database integrity
       ↓
Backend business logic
       ↓
Authentication
       ↓
Pool capacity
       ↓
Ride lifecycle
       ↓
Testing
       ↓
UI polish
       ↓
Animations
```

A beautiful UI with broken pooling logic is not a successful MVP.

------------------------------------------------------------------------

# 16. Keep Changes Small

Instead of:

``` text
Build the entire passenger system
```

break it into:

``` text
1. Add passenger page
2. Add ride request form
3. Add request API
4. Add fare calculation
5. Add request status
6. Add history
```

Test and commit each meaningful part.

------------------------------------------------------------------------

# 17. After Every Task, Report This

When a task is completed, the development report should contain:

``` text
## Completed

- What was added
- What was updated
- What was fixed

## Testing

- Tests/checks executed
- Result

## Commit

<commit hash>
<commit message>

## Push

NOT PUSHED
```

Do not push unless the user explicitly instructs it.

------------------------------------------------------------------------

# 18. Example Development Session

User says:

``` text
Add passenger ride request.
```

Development process:

``` text
1. Create feature branch if needed.
2. Add ride request model.
3. Add API endpoint.
4. Add validation.
5. Add fare calculation.
6. Add frontend form.
7. Run tests.
8. Fix any failures.
9. Run tests again.
10. Inspect git diff.
11. Commit.
12. STOP.
```

Commit:

``` text
feat(ride): add passenger ride request flow
```

Then report:

``` text
Ride request flow added and tested.

Tests:
- TypeScript: PASS
- Lint: PASS
- Unit tests: PASS
- API test: PASS

Commit:
abc1234 feat(ride): add passenger ride request flow

Push:
Not pushed.
```

------------------------------------------------------------------------

# 19. When the User Says "Push"

Only then:

``` bash
git push origin <current-branch>
```

Before pushing:

``` bash
git status
git log -1
```

Confirm the intended branch.

Never push to another branch accidentally.

------------------------------------------------------------------------

# 20. When the User Says "Continue"

Continue from the current working state.

Before making new changes:

``` bash
git status
git log --oneline -5
```

Understand what has already been completed.

Do not recreate already completed work.

------------------------------------------------------------------------

# 21. When the User Says "Fix This"

Workflow:

``` text
Inspect problem
    ↓
Reproduce
    ↓
Identify root cause
    ↓
Fix
    ↓
Test
    ↓
Retest
    ↓
Commit
```

Commit example:

``` text
fix(pool): prevent duplicate pool membership
```

Do not push automatically.

------------------------------------------------------------------------

# 22. When the User Says "Update This"

Only modify the requested area unless another change is required for
correctness.

Then:

``` text
Update
 ↓
Test affected functionality
 ↓
Run relevant checks
 ↓
Commit
```

Do not make unrelated refactors.

------------------------------------------------------------------------

# 23. When the User Says "Add This"

Implement the smallest complete version first.

Then:

``` text
Add
 ↓
Test
 ↓
Fix
 ↓
Test
 ↓
Commit
```

Additional improvements can be made in later commits.

------------------------------------------------------------------------

# 24. Final Rule

The default behavior for this project is:

``` text
ADD / UPDATE / FIX
        ↓
TEST
        ↓
FIX FAILURES
        ↓
TEST AGAIN
        ↓
COMMIT
        ↓
STOP
```

**Commit automatically after a completed logical task.**

**Never push automatically.**

Push only after the user explicitly says to push.

------------------------------------------------------------------------

# 25. Golden Rule

> **No untested feature should be committed, and no commit should be
> pushed without explicit user instruction.**

# 26. Code Comment Rules

Code-এর ভিতরে অযথা comment করা যাবে না।

Comment শুধুমাত্র তখনই ব্যবহার করবে যখন সেটা সত্যিই দরকার এবং code বুঝতে
important context দেয়।

## Comment কোথায় ব্যবহার করা যাবে

Comment ব্যবহার করা যাবে:

- Complex business logic explain করার জন্য
- Non-obvious algorithm explain করার জন্য
- Important database/concurrency logic explain করার জন্য
- কোনো unusual technical decision explain করার জন্য
- Future developer-এর জন্য গুরুত্বপূর্ণ warning/context দেওয়ার জন্য

Example:

```ts
// একই seat-er jonno concurrent request ashleo transaction use kore
// capacity overbooking prevent kora hocche.