"""Anonymous per-browser ownership.

Every visitor gets a random, unguessable id stored in an HttpOnly cookie. All
transactions, settings and manual exchange rates are filtered by that id, so a
new visitor always starts with a completely empty ledger and can never see
anyone else's data. (This is not a login: clearing cookies or switching browser
starts a fresh, empty ledger.)
"""
from __future__ import annotations

import re
import secrets

from fastapi import Request

COOKIE_NAME = "tt_owner"
COOKIE_MAX_AGE = 60 * 60 * 24 * 730  # two years
_VALID = re.compile(r"^[a-f0-9]{32}$")


def new_owner_id() -> str:
    return secrets.token_hex(16)


def is_valid_owner_id(value: str | None) -> bool:
    return bool(value and _VALID.match(value))


def get_owner(request: Request) -> str:
    """FastAPI dependency: the owner id resolved by the middleware in main.py."""
    owner = getattr(request.state, "owner_id", None)
    if not is_valid_owner_id(owner):  # defensive: middleware always sets it
        owner = new_owner_id()
        request.state.owner_id = owner
    return owner
