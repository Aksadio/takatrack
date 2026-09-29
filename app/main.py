from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import text

from app.database import engine, init_db
from app.owner import COOKIE_MAX_AGE, COOKIE_NAME, is_valid_owner_id, new_owner_id
from app.routers import dashboard, exports, settings, transactions

PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_DIR = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="TakaTrack", version="1.0.0", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=APP_DIR / "static"), name="static")
templates = Jinja2Templates(directory=APP_DIR / "templates")
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(settings.router)
app.include_router(exports.router)


@app.middleware("http")
async def assign_owner(request: Request, call_next):
    """Give each browser its own anonymous id so ledgers are never shared."""
    owner = request.cookies.get(COOKIE_NAME)
    is_new = not is_valid_owner_id(owner)
    if is_new:
        owner = new_owner_id()
    request.state.owner_id = owner
    response = await call_next(request)
    if is_new:
        response.set_cookie(
            COOKIE_NAME, owner, max_age=COOKIE_MAX_AGE, httponly=True, samesite="lax",
            secure=request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https",
        )
    return response


@app.middleware("http")
async def protect_financial_responses(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/api/") or request.url.path == "/":
        response.headers["Cache-Control"] = "private, no-store, max-age=0"
    return response


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError):
    fields = [
        {"field": ".".join(str(part) for part in error.get("loc", ())[1:]), "message": error.get("msg", "Invalid value.")}
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": "Please check the highlighted input and try again.", "fields": fields})


@app.get("/", include_in_schema=False)
async def home(request: Request):
    return templates.TemplateResponse(request=request, name="index.html", context={"app_title": "TakaTrack"})


@app.get("/manus-routes.json", include_in_schema=False)
async def route_manifest():
    return FileResponse(PROJECT_ROOT / "public" / "manus-routes.json", media_type="application/json", headers={"Cache-Control": "no-cache"})


@app.get("/favicon.svg", include_in_schema=False)
async def favicon():
    return FileResponse(APP_DIR / "static" / "favicon.svg", media_type="image/svg+xml", headers={"Cache-Control": "public, max-age=86400"})


@app.get("/healthz", tags=["system"])
async def health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok", "app": "TakaTrack"}
