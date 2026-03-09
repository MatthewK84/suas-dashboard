# sUAS Capability Readiness Dashboard

USCENTCOM AOR fielding tracker with four integrated views: program overview, capability readiness, process status, and idea intake.

## Architecture

```
suas-dashboard/
├── package.json
├── vite.config.js
├── index.html
├── server.js                  # Express API + static file serving
├── .env.example
├── sUAS_Platform_Data.xlsx    # Google Sheets upload template
└── src/
    ├── main.jsx               # React entry
    ├── App.jsx                # Tab navigation shell
    ├── IntroTab.jsx           # OVERVIEW — org structure graphic
    ├── CapabilityTab.jsx      # CAPABILITIES — sUAS platform tracker
    ├── ProcessTab.jsx         # PROCESS STATUS — R/Y/G gate tracker
    ├── IdeasTab.jsx           # IDEA INTAKE — submission & routing
    ├── useSheetData.js        # Google Sheets CSV fetch hook
    └── sampleData.js          # Fallback platform dataset
```

## Tabs

### 1. OVERVIEW
Layered organizational graphic: GOFO → C2/P2/I2/FC → CAPES+Status → Vendors.

### 2. CAPABILITIES
sUAS platform dashboard with 7-gate compliance tracking. Pulls live data from a published Google Sheet (falls back to sample data).

### 3. PROCESS STATUS
Red/Yellow/Green indicators for the full fielding workflow:
- **Core gates:** MA, RWG, FM, CONT, ADMIN, ABL
- **OTTI subsection:** Maiden Flight, Test, TTP, FG/Check Ride, Evaluate
- **Operations:** CUOPS, FUOPS, TRANSCOM Coordination

Admins authenticate with a PIN, then click indicators to cycle R/Y/G status. Admins can be created and assigned to individual gates.

### 4. IDEA INTAKE
Submit ideas routed to functional subgroups (Ops, Logistics, Intel, Comms, Fires, Engineering, Leadership). Supports priority levels, status tracking, and comments. Admins can update idea status.

## Admin System

The Process Status and Idea Intake tabs use PIN-based admin authentication.

- Default PIN: `1234` (change via `ADMIN_PIN` env var)
- Click the lock icon on either tab to authenticate
- Admin session persists in-browser until logout
- Admins created in the Process tab are available for gate assignment

## Railway Deployment

1. Push this directory to a GitHub repo
2. Create a new Railway project and connect the repo
3. Add environment variables in the service's **Variables** tab:
   - `ADMIN_PIN` — Admin authentication PIN
   - `VITE_SHEET_URL` — Google Sheets URL (optional, for live capability data)
4. Railway runs: `npm install` → `npm run build` → `npm run start`
5. Express serves the Vite build and handles `/api/*` endpoints

Data persists in a `data.json` file on disk during runtime. For production persistence across redeploys, attach a Railway volume or swap to a database.

## Local Development

```bash
cp .env.example .env        # Edit with your values
npm install
node server.js &             # Start API server on :3000
npm run dev                  # Start Vite dev server on :5173
```

Vite proxies `/api/*` requests to Express during development.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/process` | — | Get all process items and admins |
| PUT | `/api/process/:id/status` | PIN | Update item R/Y/G status |
| PUT | `/api/process/:id/admin` | PIN | Assign admin to item |
| POST | `/api/admins` | PIN | Create new admin |
| DELETE | `/api/admins/:id` | PIN | Remove admin |
| POST | `/api/auth/verify` | — | Verify admin PIN |
| GET | `/api/ideas` | — | Get all ideas and subgroups |
| POST | `/api/ideas` | — | Submit new idea |
| PUT | `/api/ideas/:id/status` | PIN | Update idea status |
| POST | `/api/ideas/:id/comments` | — | Add comment to idea |
