# Integration references

Implementation checked against the providers' official documentation on 2026-09-29.

## Google Gemini API

- [Interactions API overview](https://ai.google.dev/gemini-api/docs/interactions-overview): REST creates an interaction at `POST https://generativelanguage.googleapis.com/v1beta/interactions` with `model` and `input`; the response exposes `output_text`. The API supports `store: false` for stateless requests.
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output): JSON-schema output uses `response_format: {"type":"text","mime_type":"application/json","schema": ...}`. The documented current stable Flash model is `gemini-3.8-flash`.
- [Models](https://ai.google.dev/gemini-api/docs/models): `gemini-3.8-flash` is listed as a stable model; use a pinned stable name rather than a hot-swapped `latest` alias.
- [API keys](https://ai.google.dev/gemini-api/docs/api-key): use the `x-goog-api-key` header; keep keys in environment/secret storage and calls behind a backend, never in browser code.

TakaTrack follows that schema with a strict Pydantic validation step after decoding `output_text`. Gemini remains optional: deterministic regex parsing runs first, and raw SMS is sent to Google only when fallback is configured and triggered.

## Frankfurter exchange rates

- [Frankfurter API documentation](https://frankfurter.dev/): keyless reference-rate API used through its v2 endpoints (`/rate/{base}/{quote}` and `/currencies`). TakaTrack caches returned rates locally, prefers user-entered manual pairs, and displays stale/unavailable states rather than inventing a value.
