# TakaTrack

A mobile-first SMS expense tracker for independent shop owners. TakaTrack parses mobile-money and bank alerts, keeps the original amount and currency immutable, and presents an editable ledger, multi-currency dashboard, and CSV/PDF reports.

## What is included

- FastAPI + SQLAlchemy + SQLite backend; Jinja-rendered HTML, Tailwind CSS CDN, and vanilla JavaScript frontend.
- Regex-first parsing with strict Pydantic validation. When `GEMINI_API_KEY` is configured, uncertain messages may use the server-side Gemini JSON extractor; without a key, uncertain parses are marked for review.
- Paste, `.txt`, and `.csv` SMS import; duplicate transaction-ID and normalized-message checks; editable transaction/category fields.
- Daily, weekly, and monthly dashboard totals, cash-flow chart, category breakdown, top counterparties, search, date/type/category filters, and report export.
- Display-currency setting with keyless [Frankfurter](https://frankfurter.dev/) exchange-rate lookup, a 24-hour database cache, and manual offline rates. Original transaction amounts/currencies are not overwritten.
- English and Bengali UI, remembered light/dark theme, responsive layout, and reduced-motion support.
- Five synthetic SMS files in `samples/`, used only by the automated tests.

## Local setup and run

Python 3.11+ is required. Node.js 18+ is only needed for the optional live API/JavaScript contract smoke test; the application itself does not require Node.

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env   # if .env already exists, keep it and edit it instead
mkdir -p data
uvicorn app.main:app --host 127.0.0.1 --port 3000
```

Open <http://127.0.0.1:3000>. Stop the local server with `Ctrl+C`.

The default database is `data/takatrack.db`. Tables and the initial BDT/English preferences are created automatically at startup. You can set a different SQLAlchemy SQLite URL with `DATABASE_URL` in `.env`.

### Optional Gemini fallback

Edit the ignored local `.env` file and set a valid `GEMINI_API_KEY`. The app reads it with `python-dotenv` on the backend; it is never included in HTML or JavaScript. `GEMINI_MODEL` can override the default model. Gemini is used only for uncertain parses; the request asks for structured JSON and the result is validated before saving. The Gemini call is made only from the server, and the API request is stateless (`store: false`). Do not commit `.env` or paste credentials into source files.

## Run and check each implementation phase

Run commands from the repository root. The test suite uses synthetic messages and temporary/in-memory test databases.

### 1. Parser and tests

```bash
.venv/bin/python -m pytest -q tests/test_parser.py
```

This checks the five representative samples, extracted fields, confidence/fallback behavior, malformed input, and stable message fingerprints. It does not require a Gemini key or network access.

### 2. API and persistence

Start the server using the command above, then in a second terminal run:

```bash
.venv/bin/python -m pytest -q tests/test_api.py
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS http://127.0.0.1:3000/manus-routes.json
```

`/docs` exposes FastAPI's interactive API documentation. The route manifest lists only the dashboard page; API and system endpoints are intentionally excluded.

### 3. Dashboard and real API/JavaScript contracts

With the server still running, check JavaScript syntax and validate live responses using the same contract functions imported by the browser:

```bash
node --check app/static/js/api-contracts.js
node --check app/static/js/app.js
node --test tests/frontend-contracts.test.cjs
```

The live contract test makes read-only requests for all three dashboard periods, the ledger, settings, exports, health, and route manifest. It checks that the actual FastAPI JSON types, nullability, and decimal strings are accepted by the browser-side parsers. To check the full Python suite:

```bash
.venv/bin/python -m pytest -q
```

## Deploying online (GitHub + Render)

GitHub Pages **cannot** run this app (it only hosts static files; TakaTrack needs Python). Push the code to GitHub, then host it on Render (or Railway/Fly.io):

1. Create a free Postgres database (Neon, Supabase, or Render Postgres) and copy its connection URL. Free web hosts wipe local files on restart, so SQLite is only for local use.
2. On <https://render.com> choose **New → Blueprint** (or **Web Service**) and select your GitHub repo. `render.yaml` already contains the build and start commands.
3. In the Render dashboard, add environment variables: `DATABASE_URL` (the Postgres URL) and, optionally, `GEMINI_API_KEY`. Never put keys in code or commit `.env`.
4. Deploy, then open the Render URL. Tables are created automatically on first start.

## Privacy and data notes

- Every visitor gets a random, HttpOnly cookie (`tt_owner`). All transactions, settings and manual exchange rates are filtered by it, so each new user starts with a completely empty ledger and cannot see anyone else's data. There is no login: clearing cookies or using another browser/device starts a new, empty ledger, so users should export CSV/PDF backups. Add real accounts (email/Google login) if you need cross-device sync.
- There are no built-in sample transactions. The files in `samples/` are only test fixtures.
- If uncertain SMS is sent to Gemini, the message is transmitted to Google's API. Keep `GEMINI_API_KEY` server-side and enable Gemini only if that data flow is acceptable.
- Exchange-rate availability depends on Frankfurter's supported currencies and service availability. The app uses cached data and manual overrides where possible; stale and unavailable conversions are surfaced rather than silently fabricated. For important accounting decisions, verify rates independently.
- Many SMS alerts do not specify a timezone. Parsed timestamps preserve the local date/time text when recognizable; the app does not infer a timezone.

## Project structure

```text
app/
  main.py                  FastAPI app, lifespan, page/static routes, health
  database.py              SQLite engine and SQLAlchemy sessions
  models.py                Transactions, settings, and exchange-rate models
  schemas.py               Strict Pydantic import/edit/settings schemas
  parser.py                Regex-first parsing and optional Gemini fallback
  currency.py              Frankfurter rates, cache, and manual overrides
  services.py              Import, deduplication, filters, and dashboard totals
  routers/                 Transaction, dashboard, settings, and export endpoints
  templates/index.html     Accessible dashboard shell and dialogs
  static/css/app.css       Brand, responsive layouts, themes, and motion
  static/js/               API contracts and interactive dashboard
samples/                   Five synthetic SMS examples
public/manus-routes.json   Current website page-route manifest
tests/                     Parser, API, and live frontend-contract checks
```
