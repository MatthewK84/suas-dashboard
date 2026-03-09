# sUAS Capability Readiness Dashboard

USCENTCOM AOR fielding and compliance status tracker with live Google Sheets integration.

## Architecture

```
src/
├── main.jsx          # React entry point
├── App.jsx           # Dashboard UI (reads from useSheetData hook)
├── useSheetData.js   # Google Sheets CSV fetch + parse + auto-refresh
└── sampleData.js     # Fallback dataset (used when no sheet URL configured)
```

**Data flow:** Google Sheet → Published CSV endpoint → `useSheetData` hook (Papaparse) → React state → Dashboard UI. Auto-refreshes every 5 minutes (configurable).

## Google Sheet Setup

### 1. Create the Sheet

Create a new Google Sheet with **Row 1 as the header row** using these exact column names:

| Column | Header                | Type    | Example              |
|--------|-----------------------|---------|----------------------|
| A      | `id`                  | Text    | SYS-025              |
| B      | `name`                | Text    | Switchblade 600      |
| C      | `manufacturer`        | Text    | AeroVironment        |
| D      | `category`            | Text    | OFFENSIVE            |
| E      | `subcategory`         | Text    | Loitering Munition   |
| F      | `description`         | Text    | Man-portable anti... |
| G      | `trl`                 | Integer | 9                    |
| H      | `unitCost`            | Integer | 55000                |
| I      | `qty`                 | Integer | 1200                 |
| J      | `funded`              | Text    | PASS                 |
| K      | `dowContract`         | Text    | PASS                 |
| L      | `blueSuasNdaa`        | Text    | PASS                 |
| M      | `jagReview`           | Text    | PENDING              |
| N      | `muaTechAssess`       | Text    | PASS                 |
| O      | `warfighterCapability`| Text    | PASS                 |
| P      | `centcomReady`        | Text    | PASS                 |
| Q      | `notes`               | Text    | Combat proven. FMS…  |

**Compliance columns (J–P)** accept: `PASS`, `FAIL`, `PENDING`, `WAIVER`

**Category column (D)** accepts: `OFFENSIVE`, `DEFENSIVE`, `DUAL-USE`

### 2. Publish the Sheet

1. Open your Google Sheet
2. Go to **File → Share → Publish to web**
3. Select the target tab and choose **Comma-separated values (.csv)**
4. Click **Publish**
5. Copy the sheet URL (the standard edit URL works — the app extracts the sheet ID)

### 3. Configure the Environment Variable

**Local development** — create a `.env` file:
```
VITE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
VITE_SHEET_GID=0
VITE_REFRESH_MS=300000
```

**Railway** — add the same variables in the service's **Variables** tab.

## Railway Deployment

1. Push this directory to a GitHub repo
2. Create a new project in Railway and connect the repo
3. Add the `VITE_SHEET_URL` environment variable (and optionally `VITE_SHEET_GID`, `VITE_REFRESH_MS`)
4. Railway auto-detects Node, runs `npm install` → `npm run build` → `npm run start`
5. The `serve` package hosts the built static files on `0.0.0.0:$PORT`

No Dockerfile or Nixpacks config required.

## Local Development

```bash
cp .env.example .env
# Edit .env with your Google Sheet URL
npm install
npm run dev
```

## How Updates Work

Once connected to a published Google Sheet:

- The dashboard fetches fresh CSV data on page load
- Auto-refreshes every 5 minutes (configurable via `VITE_REFRESH_MS`)
- Manual refresh available via the ↻ REFRESH button in the data source bar
- If a fetch fails, the dashboard retains the last successful data
- If no sheet URL is set, sample data is displayed with a yellow indicator

**Anyone with edit access to the Google Sheet can add, remove, or modify platform rows — the dashboard reflects changes on next refresh with zero redeployment.**
