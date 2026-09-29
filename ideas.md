# TakaTrack Design Brief

## Direction
A polished, mobile-first fintech workspace for small shop owners: clear like a trusted ledger, smooth like a modern banking dashboard, and warm rather than corporate. Follow the user's stated Stripe/Revolut cleanliness without copying either product.

## Design movement
Contemporary fintech editorial minimalism: strong typographic hierarchy, clean surfaces, quiet geometry, small moments of motion, and a recognizable money-flow symbol.

## Core principles
- Make the money story legible immediately: received, spent, fees, and net come first.
- Show original currency alongside base-currency conversions so arithmetic stays explainable.
- Keep controls tactile and forgiving on a phone, with clear empty/error/loading states.
- Use whitespace and contrast instead of dense grids; show secondary analytics below the headline totals.
- Make privacy and AI fallback behavior understandable at the point of import.

## Color philosophy
- Deep navy `#0B1730` and ink `#101D38` anchor trust and the signature gradient hero.
- Emerald `#10B981` communicates healthy inflows and the brand's active state.
- Soft purple `#9B8AFB` is a restrained accent for insight, selection, and secondary graph detail.
- Warm near-white `#F5F7FB` keeps the light dashboard airy; dark surfaces stay navy rather than black.
- Use semantic red only for outgoing/error states and never rely on color alone to convey meaning.

## Layout paradigm
Desktop: compact, fixed-width side rail with the current view/settings and a wide breathing dashboard canvas. Mobile: single-column cards with a compact top bar, stacked actions, horizontally scrollable summary cards only where useful, and bottom-safe spacing. Use 24px card radii, soft shadows, sparse glass accents, subtle gradients, generous white space, and readable chart labels.

## Signature elements
- TakaTrack mark: a flat, high-contrast emerald money/flow glyph on a deep navy square.
- Gradient hero introducing the current shop overview and the quick-add/paste SMS action.
- Paired native/base-currency values with small conversion provenance or stale-rate cues.
- Emerald inflow and subdued contrasting outflow marks with shared icon grammar.

## Interaction philosophy
Prioritize direct manipulation and confirmation: filters feel instant, modal/edit actions preserve context, saving waits for server confirmation, and failures explain how to recover. Keep hover/press affordances subtle. No animation may obscure financial figures or block reduced-motion users.

## Animation
Stagger content entrance, count up dashboard totals from zero on first load, animate chart drawing and currency refresh, use skeletons while SMS is parsed, and give a short success pulse after a persisted save. Honor `prefers-reduced-motion`; disable count-up, parallax, and transition movement when set.

## Typography system
Inter for body, form values, and numbers; Poppins for headings/brand. Use tabular numerals for financial figures, clear weights, and a resilient local system fallback if Google Fonts are unavailable. Bengali strings must remain legible in a Bengali-capable sans-serif fallback.

## Brand essence and voice
A calm, helpful, dependable money companion for independent shopkeepers. Use concise, human language; avoid jargon and never imply that exchange rates or AI extraction are guaranteed.

## Wordmark and signature color
Use a custom `TakaTrack` wordmark in Poppins with the emerald transaction mark. Signature brand color is emerald `#10B981`, grounded by deep navy `#0B1730`.
