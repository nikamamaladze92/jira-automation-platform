# Jira Automation Platform

A full-stack automation platform that listens for inbound Jira ticket events, evaluates rule conditions, and triggers automated actions — such as posting Jira comments or sending department manager emails — through a background worker process.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│   Login → Dashboard → Tickets → Rules → Jobs → Executions      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP (JWT)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express REST API                            │
│                                                                 │
│  /auth      → Authentication (signup, login, user management)  │
│  /tickets   → Create Jira tickets + trigger automation         │
│  /rules     → CRUD for automation rules                        │
│  /events    → Inbound event log                                │
│  /jobs      → Automation job queue                             │
│  /executions → Worker execution history                        │
│  /webhooks  → Jira webhook receiver                            │
│  /demo      → Simulate events without real Jira tickets        │
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────┐           ┌──────────────────────┐
│   MongoDB Atlas  │           │   Jira Cloud API     │
│                  │           │                      │
│  users           │           │  Create issues       │
│  rules           │           │  Add comments        │
│  events          │           └──────────────────────┘
│  jobs            │
│  executions      │
└──────────┬───────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Background Worker                           │
│                                                                 │
│  Polls MongoDB every second for queued jobs                    │
│  Locks jobs atomically to prevent duplicate processing         │
│  Executes: ADD_COMMENT → Jira API                              │
│            SEND_EMAIL  → Gmail SMTP                            │
│  Records each execution with status + duration                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works

**End-to-end flow when a ticket is created:**

1. User submits a ticket form on the frontend
2. API creates the issue in Jira via the Jira Cloud REST API
3. `processIncomingEvent` is called — the event is saved with a SHA-256 fingerprint for deduplication
4. All enabled rules are loaded and evaluated against the event's conditions (priority, department)
5. For each matched rule, a job is created in MongoDB with status `queued`
6. The background worker picks up the job within 1 second, locks it atomically, and executes it
7. Results are saved to the executions collection and visible in the dashboard

---

## Tech Stack

| Layer             | Technology                 |
| ----------------- | -------------------------- |
| Frontend          | React, React Router, Axios |
| Backend           | Node.js, Express           |
| Database          | MongoDB, Mongoose          |
| Authentication    | JWT (JSON Web Tokens)      |
| Background Worker | Node.js polling worker     |
| Email             | Nodemailer + Gmail SMTP    |
| Jira Integration  | Jira Cloud REST API v3     |

---

## Key Technical Decisions

**Atomic job locking** — The worker uses `findOneAndUpdate` to claim and lock a job in a single database operation, preventing race conditions if multiple workers run simultaneously.

**SHA-256 event deduplication** — Each inbound event is hashed by its content. A unique index on the hash ensures the same event is never processed twice, even if a Jira webhook fires multiple times.

**Soft delete on rules** — Rules are never hard-deleted. Setting `isDeleted: true` preserves audit history so job executions can always be traced back to the rule that triggered them.

**Separation of concerns** — Business logic lives in `automationService.js`, not in route handlers. The same `processIncomingEvent` function is called from the ticket controller, the webhook controller, and the demo controller without duplication.

**Role-based access control** — Enforced at two levels: `restrictTo` middleware on every API route, and `RoleRoute` component on every protected frontend page.

---

## Project Structure

```
apps/
├── api/                        # Express REST API
│   ├── controllers/            # HTTP request handlers
│   ├── middleware/             # Auth, error handling, validation
│   ├── models/                 # API-specific models
│   ├── routes/                 # Route definitions
│   └── services/
│       ├── automationService.js  # Core rule matching + job creation
│       └── jiraTicketService.js  # Jira API integration
├── shared/
│   ├── db/mongoose.js          # Database connection
│   └── models/                 # Shared models (Job, Rule, Event, Execution, User)
├── web/                        # React frontend
│   └── src/
│       ├── api/client.js       # Axios instance with auth interceptors
│       ├── components/         # Layout, ProtectedRoute, RoleRoute
│       ├── context/            # Auth context
│       ├── pages/              # One component per route
│       └── styles/tokens.js    # Shared design tokens + formatters
└── worker/                     # Background job processor
    ├── services/
    │   ├── emailService.js     # Nodemailer integration
    │   └── jiraService.js      # Jira comment API
    └── worker.js               # Polling loop + job executor
```

---

## User Roles

| Role      | Access                                                                  |
| --------- | ----------------------------------------------------------------------- |
| `staff`   | Create tickets                                                          |
| `manager` | Create tickets, manage rules, view dashboard summary                    |
| `admin`   | Full access — all pages including jobs, events, executions, users, demo |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Jira Cloud account with API token
- Gmail account with an app password

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/jira-automation.git
cd jira-automation

# Install dependencies
npm install
```

### Configuration

```bash
# Copy the environment template
cp .env.example .env

# Fill in your values
nano .env

# Create frontend env file
echo "VITE_API_URL=http://localhost:3000/api/v1" > apps/web/.env
```

### Running the App

```bash
# Start the API server
npm run start

# In a second terminal — start the background worker
npm run worker

# In a third terminal — start the frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

### Seed Users

New signups default to `staff` role. To create an admin, sign up then update the role directly in MongoDB Atlas:

```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } });
```

---

## API Endpoints

| Method | Endpoint                        | Auth     | Description                             |
| ------ | ------------------------------- | -------- | --------------------------------------- |
| POST   | `/api/v1/auth/signup`           | Public   | Create account                          |
| POST   | `/api/v1/auth/login`            | Public   | Login                                   |
| GET    | `/api/v1/auth/me`               | User     | Get current user                        |
| GET    | `/api/v1/auth/users`            | Admin    | List all users                          |
| PATCH  | `/api/v1/auth/users/:id/role`   | Admin    | Update user role                        |
| PATCH  | `/api/v1/auth/users/:id/active` | Admin    | Activate/deactivate user                |
| POST   | `/api/v1/tickets`               | User     | Create Jira ticket + trigger automation |
| GET    | `/api/v1/rules`                 | Manager+ | List rules                              |
| POST   | `/api/v1/rules`                 | Manager+ | Create rule                             |
| PATCH  | `/api/v1/rules/:id`             | Manager+ | Update/toggle rule                      |
| DELETE | `/api/v1/rules/:id`             | Manager+ | Soft delete rule                        |
| GET    | `/api/v1/jobs`                  | Admin    | List jobs                               |
| GET    | `/api/v1/executions`            | Admin    | List executions                         |
| GET    | `/api/v1/events`                | Admin    | List inbound events                     |
| POST   | `/api/v1/demo/events`           | Admin    | Simulate an event                       |
| GET    | `/api/v1/health`                | Public   | Health check                            |
| POST   | `/api/v1/webhooks/jira`         | Webhook  | Receive Jira webhook                    |
