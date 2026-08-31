# BATMAN — Behavioral Analysis, Threat Monitoring & Alert Network

BATMAN is a crime-intelligence platform for community incident reporting and administrator-led verification. It deliberately distinguishes **community-submitted reports**, **verified incidents**, and **AI-assisted triage**; no automated score is a finding of fact or a basis for punishment.

## Features
- JWT/bcrypt authentication with citizen and administrator roles.
- Geolocated incident reporting with validation, throttling, duplicate signals, and human-review workflow.
- Public risk map limited to verified/resolved reports; user dashboard, nearby-incident notices, heat map, and local hotspots.
- Admin report queue with submitted → under review → verified/rejected → resolved lifecycle.
- Transparent initial threat/authenticity assessment and data-driven hotspot analysis.

## Stack
React 19 + Vite + Leaflet, Express 5 + MySQL2, JWT, bcryptjs.

## Run locally
1. Create a MySQL database and import `database/batman.sql`. Existing installs should apply `database/migrations/001_intelligence_foundation.sql` once.
2. Copy `.env.example` to `backend/.env`, use a unique 32+ character `JWT_SECRET`, and configure a least-privilege MySQL account.
3. `cd backend && npm install && npm start`
4. Copy `frontend/.env.example` to `frontend/.env`, then `cd frontend && npm install && npm run dev`.

The frontend defaults to `http://localhost:5000/api`; change `VITE_API_URL` for deployments. Set `CORS_ORIGIN` to the exact deployed frontend origin(s), comma-separated.

## Testing and checks
- `cd backend && npm test` tests triage scoring invariants.
- `cd frontend && npm run lint && npm run build` checks and builds the web client.

Read [architecture](BATMAN_ARCHITECTURE.md), [API documentation](API_DOCUMENTATION.md), [AI pipeline](AI_PIPELINE.md), and [security guidance](SECURITY.md) before deployment.
