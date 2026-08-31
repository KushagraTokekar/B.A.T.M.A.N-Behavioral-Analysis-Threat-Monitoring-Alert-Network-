# BATMAN architecture audit

## Current architecture
BATMAN is a Vite/React single-page application backed by an Express 5 API and MySQL through `mysql2`. The browser renders Leaflet maps, local heat layers, dashboards, report workflows, and admin review screens. The API uses JWT bearer tokens and bcrypt password hashes.

## Frontend
`frontend/src/App.jsx` defines public authentication and authenticated application routes. Pages live in `src/pages`, reusable map/dashboard pieces in `src/components`, and Axios configuration in `src/services/api.js`. The dashboard currently calculates nearby incidents and display hotspots in the browser; only verified/resolved reports are returned to the public map API.

## Backend and API
The entry point is `backend/server.js`; routes are separated by auth, reports, admin, and AI. `db.js` provides a MySQL pool. Key endpoints are `POST /api/auth/signup`, `POST /api/auth/login`, `GET|POST /api/reports`, `GET /api/reports/my`, `GET|PATCH /api/admin/reports`, `GET /api/ai/hotspots`, plus `GET /health`.

## Database
The legacy schema has `users` and `reports`. `database/migrations/001_intelligence_foundation.sql` brings reports into alignment with the application: review states, threat/authenticity data, occurrence time, reviewer audit fields, and map/reporter indexes.

## Authentication and intelligence
JWT claims contain the user id and role; the API verifies issuer/audience and admin routes require the admin role. The current intelligence component is a transparent, deterministic triage heuristic: report detail, severity, nearby activity, and duplicates create a threat/authenticity assessment. It **never changes a report to rejected**; suspicious signals require human review.

## Audit findings and planned improvements
The audit found a placeholder signup page, a schema/API mismatch (missing threat score and resolved state), leaked database errors, permissive CORS, public unverified reports, unsupported placeholder navigation, no central error handler, and missing project documentation. This change addresses the foundation problems. Next phases should add a tested Python model service trained on sufficient historical, lawfully sourced data; server-side analytics/predictions; alerts and evidence storage; map clustering/filtering; audit logs; and integration tests with an ephemeral MySQL database.
