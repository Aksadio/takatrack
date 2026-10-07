# TakaTrack

A mobile-first SMS expense tracker for independent shop owners. TakaTrack parses mobile-money and bank alerts, keeps the original amount and currency immutable, and presents an editable ledger, multi-currency dashboard, and CSV/PDF reports.

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
