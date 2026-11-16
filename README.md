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

**1. Route order.** I moved the 404 fallback to the top of `server.js`,
right after `const app = express()`. After that, every request returned
404, even `/`, `/hello` and `/api/courses`, and nothing was printed in the
server terminal. Express runs middleware and routes from top to bottom; a
path-less `app.use` matches every request, and because it sends a response
without calling `next()`, nothing below it (not even the logger) ever ran.

**2. Middleware.** When I removed `next()` from the logger, the browser
kept loading forever and curl hung until I stopped it with Ctrl + C. The
server still printed the log line for each request, because the logger
itself ran, but the request was never passed on to the counter or the
routes, so no response was ever sent.

**3. Status codes.** `201 Created` tells the client that the request
succeeded and that something new was created (a subscription), while `200`
only means "OK". A missing page must return `404` so that browsers, search
engines and code like `fetch` (`response.ok`) can see the error from the
status code alone; a `200` with an error message would look like a
success.

**4. Configuration.** Hosting platforms decide which port an app must use
and pass it in the `PORT` environment variable, and port 3000 may already
be taken on another machine. Reading `process.env.PORT` lets the same code
run anywhere without editing it, and `3000` stays as a local default.

**5. Dependencies.** `node_modules` is very large, can contain files that
only work on one operating system, and can be rebuilt exactly from
`package.json` and `package-lock.json`. After cloning, a teammate only
needs to run `npm install` in the project folder and then `npm start`.

**6. Same origin.** If `index.html` is opened directly from disk
(`file://`), the relative URL `/api/courses` points to a file on the disk
instead of the server, and the browser also blocks `fetch` from a
`file://` page, so every button fails. This restriction is called the
**same-origin policy**: a page may only request its own origin (protocol +
host + port) unless the server allows other origins with CORS. When the
page is served from `http://localhost:3000`, the page and the API share
the same origin.

## Self-study notes

- **Node version and uptime:** In the Node.js documentation for the
  `process` object I found `process.version`, which returns the running
  Node version (for example `v22.11.0`), and `process.uptime()`, which
  returns how many seconds the process has been running. I rounded it down
  with `Math.floor` for `/api/status`.
- **Content type:** The Express documentation shows that
  `res.type('text/plain')` sets `Content-Type: text/plain; charset=utf-8`.
  Without it, `res.send` with a string sends `text/html`. I used it for
  `/robots.txt`, `/hello` and the non-API 404.
- **Pretty JSON in the page:** `JSON.stringify(data, null, 2)` formats JSON
  with two-space indentation, and the `<pre>` element keeps the spaces and
  line breaks, so the response is easy to read.
- **Paths that work from any folder:** ES modules have no `__dirname`, so I
  used `import.meta.dirname` with `path.join` to build the path to
  `public/`. This way the page loads even when the server is started from
  another folder (`node assignment8/server.js`).
- **Express 5 wildcard:** `app.get('*', ...)` is not accepted in Express 5,
  so the 404 fallback is a path-less `app.use` placed after all routes.

## Challenges

- **Template literals:** My first start message printed
  `http://localhost:${PORT}` literally, because I used single quotes
  instead of backticks. Only backticks insert the value of `${PORT}`.
- **Port already in use:** When I ran `npm run dev` while an old server
  was still running in another terminal, the new server printed "Server
  running" and then stopped immediately, because port 3000 was already
  taken. I fixed it by closing all old terminals and starting the server
  again in a single terminal.
- **Starting the server before testing:** At first curl said "Failed to
  connect", because I had stopped the server. I learned to keep one
  terminal for the server and another for curl and git.
- **Small typos with big effects:** A wrong path made `/api/status` return
  404, and `git add README.MD` added nothing because the file is called
  `README.md`.