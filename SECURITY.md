# Security

## Controls included
- Parameterized MySQL queries, bcrypt cost 12, expiring JWTs with issuer/audience validation, role middleware, restrictive configurable CORS, JSON body limit, public-map data minimization, input bounds, submission throttling, and generic server errors.
- `.env.example` contains only placeholders. Keep `.env`, secrets, uploads, and production dumps out of Git.

## Deployment requirements
Use HTTPS, a long random JWT secret from a secrets manager, a least-privilege database account, exact CORS origins, reverse-proxy rate limiting, database backups/encryption, security headers, observability with redaction, and dependency scanning. Validate and malware-scan evidence uploads before storing them; this version intentionally does not accept file uploads.

## Responsible use
Location and incident data is sensitive. Minimize retention, show only necessary detail, restrict administrator access, maintain review/audit records, and ensure AI flags receive human review.
