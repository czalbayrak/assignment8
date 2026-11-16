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

All outputs below were produced with `curl --include` while the server was
running locally on port 3000.

### 1. Successful JSON response – `GET /api/courses`

```text
$ curl --include http://localhost:3000/api/courses
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 155
ETag: W/"9b-KePoHjTKRLTt0AQ2mjP8CpY/tjE"
Date: Mon, 16 Nov 2026 17:37:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Introduction to Programming","credits":6},{"id":2,"title":"Web Development Basics","credits":5},{"id":3,"title":"Databases","credits":4}]
```

### 2. 201 Created – `POST /api/subscribe`

```text
$ curl --include -X POST http://localhost:3000/api/subscribe
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Mon, 16 Nov 2026 17:40:55 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

### 3. 403 Forbidden – `GET /api/admin`

```text
$ curl --include http://localhost:3000/api/admin
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Mon, 16 Nov 2026 17:41:31 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

### 4. Redirect – `GET /old-page`

```text
$ curl --include http://localhost:3000/old-page
HTTP/1.1 301 Moved Permanently
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 40
Date: Mon, 16 Nov 2026 17:41:47 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Moved Permanently. Redirecting to /hello
```

### 5. 404 on an API path – `GET /api/nope`

```text
$ curl --include http://localhost:3000/api/nope
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Mon, 16 Nov 2026 17:42:08 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

### 6. 404 on a non-API path – `GET /nope`

```text
$ curl --include http://localhost:3000/nope
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 20
ETag: W/"14-uqvetqrE8oeY4r2Xn8/CTahXnYE"
Date: Mon, 16 Nov 2026 17:42:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

404 - Page not found
```

### 7. Plain-text content type – `GET /robots.txt`

```text
$ curl --include http://localhost:3000/robots.txt
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 30
ETag: W/"1e-fz6IoKfWOEcSop5pxzp50fKiI7Q"
Date: Mon, 16 Nov 2026 17:42:34 GMT
Connection: keep-alive
Keep-Alive: timeout=5

User-agent: *
Disallow: /api/
```

## Reasoning questions

## Self-study notes

## Challenges