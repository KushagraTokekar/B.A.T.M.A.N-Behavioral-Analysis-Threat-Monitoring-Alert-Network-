# BATMAN API
All API responses are JSON. Authenticated requests use `Authorization: Bearer <JWT>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create a citizen account; password minimum is 12 characters. |
| POST | `/api/auth/login` | Public | Return a time-limited JWT and sanitized user object. |
| GET | `/api/reports?limit=100` | Public | List verified/resolved reports only (maximum 250). |
| POST | `/api/reports` | Authenticated | Submit a report for human review. |
| GET | `/api/reports/my` | Authenticated | List the caller's reports, including review status. |
| GET | `/api/admin/reports` | Admin | List up to 500 reports with reporter context. |
| PATCH | `/api/admin/reports/:id/:action` | Admin | `action`: `review`, `verify`, `reject`, or `resolve`. |
| GET | `/api/ai/hotspots` | Authenticated | Return historical density-based hotspot analysis. |
| GET | `/health` | Public | Verify API/database availability. |

`POST /api/reports` accepts `incident_type`, `description`, `latitude`, `longitude`, `severity`, and optional `title`/`occurred_at`. On success it returns a report id plus `threatScore` and `authenticity`. Scores are decision support only; suspicious reports remain submitted for an administrator.
