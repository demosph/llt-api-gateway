# LittleLifeTrip (LLT) — API Gateway

An edge-facing HTTP gateway for the LittleLifeTrip platform. It proxies requests to backend microservices (Auth & User, Trip, Integration, AI Recommender), performs JWT validation, injects correlation IDs, handles CORS, rate limiting, timeouts/retries, and exposes Swagger docs.

## Features

- **JWT authentication** at the gateway (RS256/HS256, optional JWKS).
- **Proxy & path rewriting** (`/api/v1/...` → upstream services).
- **Correlation IDs** (`X-Request-Id`) propagation downstream.
- **CORS** with flexible origins.
- **Rate limiting** (window/max via env).
- **Timeouts and retries** to upstreams.
- **Swagger UI** at `/api/docs`.
- **Health endpoint** at `/api/health`.

## Architecture & Routing

The gateway is the external entry point and routes requests to service backends.

| Incoming Path            | Upstream Target                | Notes                                         |
| ------------------------ | ------------------------------ | --------------------------------------------- |
| `/api/v1/auth/*`         | `${AUTH_BASE_URL}/v1/*`        | Public endpoints like login/register/id-token |
| `/api/v1/trips/*`        | `${TRIPS_BASE_URL}/v1/*`       | Requires JWT                                  |
| `/api/v1/integrations/*` | `${INTEGRATION_BASE_URL}/v1/*` | Mixed public/JWT                              |
| `/api/v1/ai/*`           | `${AI_BASE_URL}/internal/v1/*` | Requires JWT                                  |
| `/api/health`            | Handled by the gateway         | Liveness/readiness                            |
| `/api/docs`              | Swagger UI                     | Gateway's own API                             |

The exact public paths are controlled via PUBLIC_PATHS (comma-separated list of path prefixes).

## Requirements

- Node.js **18+** (recommended 20/22)
- npm / pnpm / yarn
- Docker 24+ (for containerized runs)
- Kubernetes cluster (e.g., EKS), Helm 3, Argo CD

## Environment Variables

Create a .env (or inject via K8s Secrets/ConfigMap):

```
# App
NODE_ENV=development
PORT=3000
PUBLIC_BASE_URL=http://localhost:3000

# Upstreams
AUTH_SERVICE_URL=http://auth-service:3001
TRIP_SERVICE_URL=http://trip-service:3002
INTEGRATION_SERVICE_URL=http://integration-service:3003
AI_SERVICE_URL=http://ai-recommender:8000

# Auth (choose one approach)
# JWT_ALG=RS256
# Option A: local public key
# JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
# Option B: JWKS
# JWT_JWKS_URL=https://issuer.example.com/.well-known/jwks.json

# If HS256:
JWT_ALG=HS256
JWT_SECRET=supersecret

# CORS
CORS_ORIGIN=*

# Gateway controls
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
REQUEST_TIMEOUT_MS=10000
RETRY_ATTEMPTS=1
LOG_LEVEL=info

# Comma-separated public route prefixes (no JWT required)
PUBLIC_PATHS=/api/v1/auth/login,/api/v1/auth/register,/api/v1/auth/oauth/google,/api/v1/auth/oauth/google/idtoken
```

## Local Development

```
npm ci
npm run dev   # or: npm start
# open http://localhost:3000/api/health and http://localhost:3000/api/docs
```

Point the upstream URLs to your local/staging services as needed.

## Swagger

- UI: `/api/docs`
- The OpenAPI document is generated in `src/swagger.js`.

## Docker

**Build & Run**
`docker compose up --build`

### Request Examples

**Health**
`curl -i https://localhost:3000/api/health`

**Login (public)**

```
curl -X POST https://api.dev.llt.io/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"***"}'
```

**Trips (JWT required)**

```
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  "https://api.dev.llt.io/api/v1/trips?limit=10"
```

## Security

- JWT is verified before proxying (RS256/HS256 or JWKS).
- Keep secrets in K8s Secrets / External Secrets (SSM/Secrets Manager).
- Don't log PII or secrets; propagate `X-Request-Id.`
- Apply rate limiting per IP/token.
- Use strict `CORS_ORIGIN` in production.

## Troubleshooting

- **401 Unauthorized:** missing/invalid token. Check `Authorization` and `JWT_*` envs.
- **403 Forbidden:** token OK but not allowed route or role; verify claims and policy.
- **502/504 from ALB:** upstream not ready/unreachable. Check service selectors, probes, timeouts.
- **CORS issues:** verify `CORS_ORIGIN` and response headers.
- **Domain doesn't resolve:** add/update Route53 record pointing to ALB hostname (public zone).
