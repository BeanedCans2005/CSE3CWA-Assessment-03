# AI Capsule - Cloud-Deployed AI Prompt Manager

**Student:** Matthew James Elliott - 22453699
**Subject:** CSE3CWA - Assignment 3
**Live URL:** https://cse3cwa-assessment-03-4605.onrender.com
**Cloud Platform:** Render (free web service)

---

## 1. Overview

AI Capsule is a full-stack CRUD application for saving and managing AI prompts. Users
sign in with GitHub OAuth, and the Express backend issues it's own application JWT
(stored in a Secure, HttpOnly cookie) to protect all capsule data. Each user can only
create, read, update, and delete their own prompt records.

## 2. Tech Stack

| Component         | Technology                            |
|-------------------|---------------------------------------|
| Frontend          | React (Vite)                          |
| Backend           | Node.js + Express                     |
| Authentication    | GitHub OAuth -> Express-issued JWT    |
| Session storage   | Secure, HttpOnly cookie named `token` |
| Database          | SQLite (better-sqlite3)               |
| Deployment        | Render (free web service )            |

## 3. Installation & Run Instructions

Clone the repository, then from the project root:

```bash
npm run install:all
```

This installs dependencies for the root, `client/`, and `server/` in one step.

Copy the example environment file and fill in your own values:

```bash
cd server
cp .env.example .env
```

Required environment variables (See section 6 for details):

PORT = 5000
JWT_SECRET = <a long random string>
GITHUB_CLIENT_ID = <your GitHub OAuth App client id>
GITHUB_CLIENT_SECRET = <your GitHub OAuth App client secret>
GITHUB_CALLBACK_URL = http://localhost:5000/api/auth/github/callback

Run in development (two terminals):

```bash
# Terminal 1 - from server/
npm run dev

# Terminal 2 - from client/
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to Express on port 5000.

**Production build** (what Render runs):

```bash
npm run build: client   # builds React into client/dist
npm run start           # Express serves client/dist + the API from one origin
```

## 4. API Routes

| Route                      | Access    | Purpose                                          |
|----------------------------|-----------|--------------------------------------------------|
| `/`                        | Public    | Landing page                                     |
| `/login`                   | Public    | Starts GitHub OAuth login                        |
| `/dashboard`               | Protected | Authenticated users prompt records               |
| `GET /api/health`          | Public    | Returns '{ "status": "ok" }'                     |
| `GET /api/capsules`        | Protected | Read the authenticated users records             |
| `POST /api/capsules`       | Protected | Create a new record                              |
| `PUT /api/capsules/:id`    | Protected | Update a record (only if owned by the caller)    |
| `DELETE /api/capsules/:id` | Protected | Delete a record (only if owned by the caller)    |

The React frontend communicates with Express entirely through `fetch()` calls to
these `/api/...` paths. Because Express serves the built React app from the same origin in
production, no CORS configuration is needed, and the `token` cookie is sent
automatically on every request via `credentials: 'include'`.

## 5. OAuth & JWT Flow
1. The user clicks **Sign in with GitHub** on `/login`, which redirects to
`GET /api/auth/github`.

2. Express generates a random `state` value (CSRF protection), stores it in a
short-lived cookie, and redirects the browser to GitHub's OAuth authorize URL.

3. After the user approves access, GitHub redirects back to
`GET /api/auth/github/callback` with a temporary `code`.

4. Express exchanges that code for a GitHub access token, then calls GitHub's
`/user` endpoint once to retrieve the user's GitHub ID and username.

5. Express signs its **own** application JWT (`jsonwebtoken`) containing the
GitHub user ID and username, and sets it as a **Secure, HttpOnly** cookie
named `token`. The GitHub access token itself is discarded - it is never
stored or reused.

6. Every request to `/api/capsules/*` passes through `requireAuth` middleware,
which verifies the JWT from the `token` cookie. The user's identity is taken
only from the verified JWT payload - never from the request body or query
string - so ownership cannot be spoofed by the client.

## 6. Environment Variables

| Variable                  | Purpose                                                                   |
|---------------------------|---------------------------------------------------------------------------|
| `PORT`                    | Port Express listens on (Render sets this automatically in production)    |
| `JWT_SECRET`              | Secret used to sign/verify the application JWT                            |
| `GITHUB_CLIENT_ID`        | GitHub OAuth App client ID                                                |
| `GITHUB_CLIENT_SECRET`    | GitHub OAuth App client secret                                            |
| `GITHUB_CALLBACK_URL`     | Must exactly match the callback URL registered on GitHub                  |

No secret values are committed to this repository -`.env` is excluded via `.gitignore`.

## 7. Database

SQLite (`better-sqlite3`), initialised automatically on sever start from
`sever/db/db.js`. The `capsules` table matches the schema specified in the
assignment brief, with `user_id` storing the GitHub user ID obtained from the
verified JWT.

**Persistence note:** Render's free tier uses an ephemeral filesystem, so the
SQLite database file may be reset after a restart or redploy. This is a known
limitation of the free tier rather than an application bug - see Section 9.

## 8. Required cURL Verification

Run against the deployed API:

```bash
curl -i https://cse3cwa-assessment-03-4605.onrender.com/api/capsules
```
**Result:** `401 Unauthorized` - [
date: Wed, 23 Sep 2026 02:05:33 GMT
content-type: application/json; charset=utf-8
cf-cache-status: DYNAMIC
etag: W/"18-e38SynFeViHMIx4eCMwWzX8uuY8"
rndr-id: 128d5efc-0794-4e9c
server: cloudflare
vary: Accept-Encoding
x-powered-by: Express
x-render-origin-server: Render
cf-ray: a3f5fba1983ae6a9-MEL
alt-svc: h3=":443"; ma=86400

{"error":"Unauthorised"}%  ]

```bash
curl -i -H "Cookie: token=fake-token-123" https://cse3cwa-assessment-03-4605.onrender.com/api/capsules
```
**Result** `401 Unauthorized` - [
date: Wed, 23 Sep 2026 02:07:08 GMT
content-type: application/json; charset=utf-8
cf-cache-status: DYNAMIC
etag: W/"18-e38SynFeViHMIx4eCMwWzX8uuY8"
rndr-id: 346183a1-ad40-4ee8
server: cloudflare
vary: Accept-Encoding
x-powered-by: Express
x-render-origin-server: Render
cf-ray: a3f5fe79da368df6-MEL
alt-svc: h3=":443"; ma=86400

{"error":"Unauthorised"}%         
]

Both confirm the backend rejects requests with no JWT and requests with an
invalid JWT, rather than merely checking for the cookie's presence.

## 9. Known Limitation

SQLite storage on Render's free tier is not persistent across restarts or
redeploys, since the local filesystem is ephemeral. For this assignment's
scope, this is an accepted trade-off of using the free tier rather than a
managed database - a production deployment would use Render PostgreSQL or
an equivalent managed database instead.

## 10. AI-Assisted Development

**AI tool used:** Claude (Anthropic), used throughout for scaffolding the
project structure, writing the Express routes and JWT middleware, the GitHub
OAuth flow, and debugging deployment issues.

**Problem found and corrected in AI-generated code:**: A template literal in
the Github `/user` fetch was written with straight quotes instead of backticks
(`'Bearer ${tokenData.access_token}'` instead of `` `Bearer ${tokenData.access_token}` ``),
so the literal string `${tokenData.access_token}` was sent to GitHub instead of
the actual token, causing a "Bad Credentials" error. Diagnosed by logging GitHub's
actual API response and comparing it against a direct curl test with the same token.

**How OAuth/JWT/protected-API behaviour was verified:** Logged in through the
live GitHub OAuth flow and confirmed the `token` cookie was set as HttpOnly
via browser dev tools. Ran the two required cURL checks against the deployed
`/api/capsules` endpoint to confirm 401 responses with no cookie and with an
invalid cookie.

**How CRUD and ownership were verified:** Created, edited, and deleted prompt
records through the deployed dashboard UI while logged in, confirming each
operation persisted correctly and only affected records tied to the
authenticated user's ID (enforced via `WHERE user_id = ?` on every query).

