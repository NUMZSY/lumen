# LUMEN Scramjet service

This folder is a separate Docker-deployable Scramjet service for LUMEN. It is based on the official [Mercury Workshop Scramjet-App](https://github.com/MercuryWorkshop/Scramjet-App) (AGPL-3.0); the upstream license is included in `LICENSE`. Changes in this folder are published in this repository so users of the hosted service can inspect its source.

The service is intentionally **not an unrestricted public proxy**. It requires a strong access code before issuing a signed, eight-hour browser-session token. The token stays in that service tab's `sessionStorage` and is sent only on its same-origin WISP WebSocket handshake; it is not added to the target URL. The browser removes an initial `?url=` target from the address bar after reading it, and the app redacts query URLs from its own HTTP request logs. A hosting provider or reverse proxy may keep separate access logs, so do not use this service for sensitive searches unless you trust that host. WebSocket transport accepts only valid tokens and same-origin handshakes; UDP is disabled, and a denylist blocks common local/private/metadata hostname patterns. This denylist is defense-in-depth, not a replacement for host-level egress controls.

## Requirements

Deploy this service separately from the LUMEN Next.js frontend. The host must run the included Dockerfile, provide a stable HTTPS origin, permit outbound web requests, support WebSocket upgrades at `/wisp/`, and keep long-lived WebSocket connections open. The proxy service must be deployed at the **root of its own origin**, such as `https://proxy.example.com`; a subpath is not supported because the service worker needs a predictable origin scope.

## Configure the service

Set these variables in your host's secret/environment settings. Do not commit actual values:

| Variable | Required value |
| --- | --- |
| `PUBLIC_URL` | Exact service origin, e.g. `https://proxy.example.com` (no path or trailing route) |
| `LUMEN_ORIGIN` | Exact production LUMEN origin allowed to embed the service, e.g. `https://lumen.example.com` |
| `PROXY_ACCESS_PASSWORD` | A random private code with at least 24 characters; share it only with intended users |
| `PROXY_TOKEN_SECRET` | A separate random signing secret with at least 32 characters |
| `PORT` | Supplied by the host, or `8080` |
| `TRUST_PROXY` | Optional; set to `1` only when the host overwrites forwarded IP headers with trusted values |

Generate separate secrets locally with `openssl rand -hex 16` (access code) and `openssl rand -hex 32` (token-signing secret). Enter the generated values directly into the host's secret settings; do not send them in chat or commit them. `GET /healthz` is an unauthenticated health check and does not expose configuration.

The server will refuse to start if required origins/secrets are missing, origins include paths, a production origin is not HTTPS, or secrets are too short. The browser page asks for the access code on first use; it is never put into the `?url=` destination parameter.

## Deploy with Docker

Build this folder as the service root:

```sh
docker build -t lumen-scramjet .
```

Configure the required environment variables in the host dashboard, then deploy the image and set its health check to `/healthz`. The included Dockerfile listens on `0.0.0.0:$PORT` (default `8080`). Keep the service at `/` on its own hostname so `/sw.js`, `/scram/`, `/baremux/`, `/libcurl/`, and `/wisp/` stay on the same origin.

For local development, use these values (not production): `PUBLIC_URL=http://localhost:8080` and `LUMEN_ORIGIN=http://localhost:3000`, plus locally generated secrets. In this folder run `pnpm install --frozen-lockfile`, export those variables, then `pnpm start`.

## Connect LUMEN

After the service is live, set `NEXT_PUBLIC_SCRAMJET_ENDPOINT` on the LUMEN frontend's build/deployment environment to the service origin, e.g. `https://proxy.example.com`, and redeploy LUMEN. Fresh LUMEN profiles default to the Scramjet engine and this endpoint; users can also edit the endpoint and disable the proxy in Settings. With no configured endpoint, LUMEN keeps using the direct provider fallback.

The bundled backend supports **Scramjet only**. Selecting Ultraviolet requires a separately deployed Ultraviolet-App endpoint; this folder does not silently pretend a Scramjet service is Ultraviolet-compatible.

## Upstream attribution

- Upstream project: [MercuryWorkshop/Scramjet-App](https://github.com/MercuryWorkshop/Scramjet-App)
- Upstream commit used as the starting point: `f6f83cbc93091e47b9c357eb00ea289828aedf94`
- License: GNU Affero General Public License v3.0; see `LICENSE` and the upstream project for the corresponding source.
