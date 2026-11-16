# Assignment 8 - My First Back-End

A small Node.js + Express 5 information server for a made-up study programme (Open Code Academy). It serves a web page and a few API routes, logs every request and counts how many requests it has served.

# How to install and run

Requirements: Node.js LTS and npm.

```bash
git clone https://github.com/czalbayrak/assignment8.git
cd assignment8
npm install
npm start
npm run dev
```

Then open http://localhost:3000. To use another port: `PORT=4000 npm start`.

#File organization

| File | Purpose |
| --- | --- |
| `server.js` | Express app: data, middleware, routes, 404 fallback |
| `public/index.html` | The page served at `/` |
| `public/styles.css` | Page styles |
| `public/app.js` | Button logic with `fetch()`|
| `package.json` | ES modules, scripts, Express dependency |
| `package-lock.json` | Exact  dependency versions |
| `.gitignore` | Keeps `node_modules/` and `.env` out of git |

## Routes

| Method and path | Response |
| --- | --- |
| GET `/` | `public/index.html` (via `express.static`) |
| GET `/hello` | 200, plain text |
| GET `/robots.txt` | 200, `text/plain` |
| GET `/old-page` | 301 redirect to `/hello` |
| GET `/api/courses` | 200, JSON array of courses |
| GET `/api/status` | 200, `{ status, nodeVersion, uptimeSeconds }` |
| GET `/api/headers` | 200, `{ userAgent, accept }` |
| POST `/api/subscribe` | 201, `{ "subscribed": true }` |
| GET `/api/admin` | 403, `{ "error": "Forbidden" }` |
| GET `/api/stats` | 200, `{ "requestsServed": n }` |
| anything else | 404: JSON for `/api...`, plain text otherwise |

I chose `301 Moved Permanently` for `/old-page` because the page has moved
permanently to `/hello`.

## Middleware and order

Order in `server.js`: logger → request counter → `express.static` → routes
→ 404 fallback.

- The **logger** is first so that every request is printed (timestamp,
  method, URL), even static files and 404s. It calls `next()` so the
  request continues.
- The **counter** comes right after it, before `express.static`, so it
  counts **every request the server receives**: the page, `styles.css`,
  `app.js`, `favicon.ico`, API calls, 404s and `/api/stats` itself. I chose
  this because I wanted the number to show the real load on the server.
  Opening the page once therefore adds 3–4 to the counter.
- `express.static` comes before the routes so files in `public/` are served
  directly.
- The **404 fallback** is last, so it only runs when no route matched and
  never hides a real route.

## Testing evidence (curl)

## Reasoning questions

## Self-study notes

## Challenges