# Project Instructions (Recommended)

This project prioritizes stability, predictability, production-readiness and cost-awareness over experimental features.

## Model usage

- **Default model for all coding, system logic, business-critical reasoning tasks**: Gemini 3.1 Pro (stable)
- **Use Gemini 3 Flash only for lightweight / high-throughput / cost-sensitive tasks** (UI copy, simple validation, formatting, background jobs).
- **Do NOT use any preview / experimental models** (e.g. 3.1 Pro Preview, Deep Think unless explicitly approved) in production paths, authentication flows, admin dashboards, payment/credential handling, or automation pipelines.
- **Preview / experimental models may be used ONLY in isolated sandboxes**, A/B test branches, or non-customer-facing research prototypes.

## Engineering principles

- Prefer deterministic behavior over clever or speculative solutions.
- Avoid long-running or blocking operations without explicit timeouts (default ≤ 8s for most API calls).
- All authentication, rate-limit, blocking, and notification logic must be explicit, auditable, and fail-safe.
- Treat every async call as potentially slow or unreliable; always include fallback logic and circuit-breaker pattern where appropriate.

## Security & admin logic

- Admin dashboards must assume hostile input by default (validate, sanitize, CSP, etc.).
- Implement rate limiting, login attempt thresholds, and automatic blocking rules explicitly.
- **Example policy**: If the same account attempts login ≥10 times within 60 seconds → block immediately, log event, send real-time notification to admin channel (Telegram or equivalent).
- All blocks, high-risk actions, and security events must generate real-time notifications to the admin bot/channel.

## Observability

- Log security-relevant events clearly (timestamp, user identifier or anon-id, IP country, reason, before/after state if applicable).
- Avoid silent failures. If something fails, fail visibly and safely (return 5xx with retry-after when appropriate, never swallow errors).

## UI & UX

- Keep UI minimal, fast, and functional.
- Avoid unnecessary animations, heavy JS effects or media auto-play that can trigger browser issues.
- **Use properly bundled Tailwind via build tooling** — never rely on CDN in production.

## Tone & output

- Be concise and direct.
- Prefer actionable code, configuration, and tests over long explanation.
- When uncertain, state assumptions explicitly rather than guessing.
