# RouteFinderX1 — Tech Stack Survival Guide

> Companion to `INTERVIEW_GUIDE.md`. Everything here is tied to a dependency that is **actually in your `package.json` files**. For each: what it is, how it works underneath, where it appears in *your* code, the questions you will be asked, and the answer that scores.
>
> **How to use this:** read §A and §B properly (they're the foundation everything else rests on), then skim the rest. §T at the end is a 45-question rapid-fire drill for the night before.

---

## A. The foundation — Node.js and JavaScript

Everything on your backend is a consequence of one fact: **Node runs your JavaScript on a single thread.** If you understand that properly, half the stack questions answer themselves.

### A1. The event loop — the question you *will* be asked

**What it is:** Node executes JS on one thread. Anything that waits — a network read, a file read, a DNS lookup — is handed to the OS (via **libuv**) and registered with a callback. The event loop is the loop that says: "is anything finished? Then run its callback." So Node handles thousands of *concurrent* connections with one thread, because waiting costs nothing. What it cannot do is two **computations** at once.

**Phases of one loop tick** (worth naming — it signals depth): timers (`setTimeout`/`setInterval`) → pending callbacks → poll (I/O) → check (`setImmediate`) → close callbacks. Between every phase, Node drains the **microtask queue** (promise `.then`, `await` continuations, `queueMicrotask`) — which is why a resolved promise always runs before a `setTimeout(…, 0)`.

**In your code:**
- `await Train.find(...)` inside the `while` loop (`multistoproutes.js:137`) — the handler *yields* here. Other requests get served during the wait. This is why your API feels fine despite doing 10 sequential queries.
- `await bcrypt.hash(password, salt)` (`auth.js:38`) — **this one does not yield in a useful way.** It's ~50-100 ms of real CPU work. `bcryptjs` (pure JS) chunks it with `setImmediate` so the loop isn't hard-blocked, but the CPU is still yours alone, so throughput is capped.
- Your graph traversal between the `await`s — pure CPU, fully blocking.

**Q: "Node is single-threaded — how does it handle 1000 concurrent users?"**
> "It's single-threaded for *my* JavaScript, not for I/O. libuv hands waiting off to the OS and gives me a callback, so 1000 connections that are all waiting on MongoDB cost me almost nothing — they're just entries in the event loop. What I can't do is two computations at once, so my real risk is CPU: bcrypt at cost 10 is 50-100 ms per login, and my graph traversal is CPU too. While either runs, nobody else progresses. That's why I'd move the search to `worker_threads` at scale and autoscale on **event-loop lag** rather than CPU percentage — lag is the metric that predicts user pain in Node."

**Q: "What's the difference between blocking and non-blocking here?"**
> "Non-blocking = I hand the work to the OS and get control back (every `await` on a Mongo query). Blocking = I hold the thread (JSON parsing of a huge body, bcrypt, my BFS loop). The tell is whether the work is I/O or CPU."

**Follow-up you'll get: "Where would you put a CPU-bound task?"** → `worker_threads` (shares memory via `SharedArrayBuffer`, cheap), `child_process`/cluster (separate processes, one per core), or a separate service behind a queue. Node also has a **libuv thread pool** (default 4 threads, `UV_THREADPOOL_SIZE`) used by `fs`, DNS and native crypto — but *not* by your pure-JS bcryptjs.

### A2. Promises, async/await, and error handling

- `async` functions always return a promise; `await` unwraps it and, on rejection, **throws** at that line — which is why `try/catch` works on async code.
- **Every one of your handlers is wrapped in `try/catch`.** Know why that matters: an unhandled rejection in Node 15+ **crashes the process** by default.
- **`Promise.all` vs sequential awaits** — your traversal awaits one query at a time. `Promise.all` would fire a whole frontier layer in parallel. Also know `Promise.allSettled` (never rejects), `Promise.race`, and `Promise.any`.

**Q: "How would you parallelise your database calls?"**
> "Collect the frontier's distinct stations, then either `Promise.all(stations.map(s => getTrains(s)))` to overlap the round-trips, or better, one query with `$in: stations` so it's a single round-trip instead of N."

### A3. Language mechanics that appear in your code

| Feature | Where | What to say |
|---|---|---|
| **Spread** `[...route, leg]`, `{...formData, [name]: value}` | `multistoproutes.js:151`, `SearchExperience.js:29` | Creates a **shallow** copy — required for React immutability and to stop sibling branches sharing a path array |
| **Computed property names** `[e.target.name]: e.target.value` | `handleChange` | One handler for nine inputs |
| **Destructuring with defaults** `const { maxStops = 3, page = 1 } = req.body` | `:26-36` | Defaults apply only for `undefined`, **not** for `null` or `""` — a real footgun |
| **Optional chaining** `err.response?.data.message` | `SearchExperience.js:53` | Note the bug: the `?.` guards `response` but **not** `data`, so a response without a body still throws |
| **Template literals** for cache keys | `:59` | String building; missing delimiter discussion in §6 of the main guide |
| **Closures** — `filterByDate`, `getTrains` capture `dateOfJourney` | `:43-67` | They close over the request scope; that's why the cache is per-request and thread-safe by construction |
| **`Number()` vs `parseInt`** | `SearchExperience.js:42` | `Number("")` is `0`, `Number("abc")` is `NaN`, `parseInt("12abc")` is `12`. Your `NaN` filter bug lives here |
| **CommonJS vs ESM** | `"type": "commonjs"` | `require` is synchronous and cached (that's why your Mongoose connection and mail transporter are effectively singletons); `import` is static, hoisted, tree-shakeable. Frontend is ESM via webpack |

### A4. npm mechanics

- **`^1.2.3`** allows any `1.x.x` ≥ 1.2.3 (minor + patch). **`~1.2.3`** allows patch only. Your files use `^` throughout.
- **`package-lock.json`** pins the exact resolved tree so builds are reproducible. **`npm ci`** installs strictly from the lock and is what CI should use; `npm install` may update the lock.
- **Trap in your repo:** the root `package-lock.json` is an empty stub (`"packages": {}`) with no `package.json` beside it — harmless, but if asked, "it's a leftover; the real lockfiles are in `Back_end/` and `train-route-frontend/`."
- `dependencies` ship to production; `devDependencies` don't (`nodemon`, `tailwindcss`, `postcss`, `autoprefixer` are correctly placed).

---

## B. Express 5

**What it is:** a minimal, unopinionated HTTP framework. It's essentially a router plus a middleware pipeline over Node's built-in `http` module. It gives you almost nothing you didn't ask for — which is why your app has no DI, no layering, and no validation conventions unless you add them.

**How a request flows:** `http` server → Express `app` → each `app.use`/route matcher in **registration order** → each middleware either responds or calls `next()` → if `next(err)` is called or a handler throws, Express skips to the first **error-handling middleware** (the 4-argument one).

**In your code:** `cors()` → `express.json()` → `/api/auth` router → `/api/trains` router → `auth` middleware on the one protected route → handler.

### What's new in Express 5 (asked because you're on 5.1, and most people are on 4)

1. **Async errors are auto-forwarded.** In Express 4, a rejected promise inside an `async` handler was swallowed and the request hung — everyone used `express-async-handler` or wrapped everything. In Express 5, rejections are passed to `next(err)` automatically.
   > **Say this:** "Express 5 forwards async rejections to the error handler for me. But I don't have an error handler registered, so a rejection falls through to Express's default one, which returns an HTML error page instead of JSON. That's why every handler in my code has its own try/catch — and it's also why adding a central error middleware is on my list."
2. **`path-to-regexp` v8:** bare `*` wildcards must now be named (`/files/*splat`), and regex-in-string paths are gone. Nothing in your app uses wildcards, so you're unaffected — but that's the answer if asked "what breaks when upgrading?"
3. **`req.query` is a getter** and the query parser is `simple` by default (no more nested `a[b]=c` objects unless configured).
4. Removed: `res.send(status)`, `app.del()`, `res.redirect('back')`, `req.param(name)`.
5. Requires **Node 18+**.

**Q: "Why Express and not NestJS/Fastify?"**
> "Express is tiny and explicit — for a two-endpoint API it's the right amount of framework and there's no build step or magic. The cost is that it gives me no structure, and you can see that in my code: one route handler doing HTTP parsing, validation, the algorithm and data access. NestJS would have pushed me into controllers, services, providers and validation pipes, which is exactly the layering I'm missing. Fastify would give me ~2× the throughput and JSON-schema validation built in. If this grew past a handful of endpoints, I'd move."

**Q: "What is middleware?"** → A function `(req, res, next)` in a pipeline that can inspect/mutate the request, short-circuit with a response, or pass control on. It's the Chain-of-Responsibility pattern. Yours: `cors`, `express.json`, `auth`. Missing: `helmet`, `express-rate-limit`, `compression`, a request logger, and an error handler.

**Q: "`app.use` vs `router.post` — what's the difference?"** → `app.use` mounts for all methods and matches path *prefixes*; `router.post` matches an exact path and one method. That prefix behaviour is why `app.use('/api/auth', authRoutes)` makes every route inside the router relative to `/api/auth`.

---

## C. MongoDB + Mongoose + Atlas

### C1. MongoDB itself

- **Document store.** Data is **BSON** (binary JSON with extra types: `ObjectId`, `Date`, `Decimal128`, `Binary`). Documents live in collections; no schema is enforced by the server.
- **`_id`** is a 12-byte `ObjectId`: 4-byte timestamp + 5-byte random + 3-byte counter. So ObjectIds are **roughly time-sortable** and you get a creation timestamp for free — worth knowing, since you have no `createdAt`.
- **Indexes are B-trees.** A lookup is O(log n) to find the entry, then a fetch of the document. Without an index, it's a **COLLSCAN** — read every document.
- **Compound indexes** follow the **prefix rule**: an index on `{a, b, c}` serves queries on `a`, `a+b`, `a+b+c` — but *not* `b` alone. Order them by the **ESR rule**: Equality fields first, then Sort fields, then Range fields.
- **The query planner** tries candidate plans, caches the winner, and `explain("executionStats")` shows you which won. Look for `IXSCAN` (good) vs `COLLSCAN` (bad), and compare `totalDocsExamined` to `nReturned` — if you examined 10,000 to return 10, your index is wrong.
- **Replica set:** one primary (writes) + secondaries (replicating via the **oplog**). Automatic failover by election. You can send reads to secondaries with a read preference, accepting eventual consistency.
- **Aggregation pipeline:** `$match → $group → $sort → $project → $lookup` etc. You don't use it, but know that `$match` first is the optimisation rule, and that `$lookup` is Mongo's (left-outer) join.
- **Transactions** exist since 4.0 (multi-document, on replica sets) — you use none, correctly, since you have no multi-document writes.

**Q: "Why is a document store a bad fit for a graph problem?"** — the honest, high-scoring answer:
> "Because traversal means following relationships, and a document store has no server-side traversal primitive that fits per-hop filtering. So I do it in application code and pay a network round-trip per hop. In Postgres a `WITH RECURSIVE` CTE does the whole search inside the database in one query; in Neo4j it's a variable-length `MATCH`. Mongo does have `$graphLookup` for recursive lookups, but it's awkward with per-hop fare/seat filters and has a 100 MB memory ceiling. My mitigation was memoising adjacency per request; the real fix is holding the timetable in memory."

**Q: "What indexes do you have and what should you have?"** → §7.9 and Q27 of the main guide. Short version: you have `trainNumber` unique + single-field `source` and `destination`; you want compound `{source:1, destination:1, dateOfJourney:1}` and `{source:1, dateOfJourney:1}`.

### C2. Mongoose (the ODM)

**What it does that the raw driver doesn't:** schemas + validation, type casting, middleware/hooks (`pre('save')`), virtuals, population (client-side joins), and index declaration.

Things in your code worth knowing:

- **`mongoose.model('Train', schema)`** compiles a model once per process and caches it — a **singleton** via the CommonJS module cache. Registering the same name twice throws `OverwriteModelError`.
- **Casting is your accidental injection defence** (§13, S-note): a `{"$ne": null}` payload can't reach a `String`-typed path.
- **`unique: true` is not validation** — it declares an index. Mongoose builds indexes in the background at startup by default (`autoIndex`, which you should disable in production and manage indexes explicitly).
- **`.lean()`** skips document hydration → plain objects, big CPU/memory win on read-heavy paths. You use it correctly.
- **Buffering:** if the connection isn't up, Mongoose queues operations for `bufferTimeoutMS` (default 10 s) then errors. So a DB outage after boot shows up as slow requests then 500s — useful when explaining failure modes.
- **Connection pooling:** one pool per `mongoose.connect`, default `maxPoolSize` 100. You never manage sockets yourself.
- **`strictQuery`/`strict`:** unknown fields in queries/documents are stripped by default — silent, and worth knowing when a filter "does nothing".

**Q: "Mongoose vs the native driver?"** → Mongoose buys schemas, casting, hooks and populate at the cost of a performance overhead and an abstraction that can hide what the query actually does. For a typed, schema-first project, or a very hot path, the native driver (or Prisma) is defensible.

### C3. Atlas

Managed MongoDB. Know: the `mongodb+srv://` scheme does a DNS SRV lookup to discover the replica set members; the **IP access list** is the primary network control (`0.0.0.0/0` = open to the internet, protected only by your password — check yours); database users are separate from Atlas account users and should be least-privilege; **M0 free tier is shared, 512 MB, and has no automated backups** (verify on your cluster's tier — this is your §15 disaster-recovery score).

---

## D. Auth stack

### D1. `jsonwebtoken` v9

**Structure:** `base64url(header).base64url(payload).base64url(signature)`. Header = `{alg:'HS256', typ:'JWT'}`. Signature = `HMAC-SHA256(header.payload, secret)`.

**`sign`** builds and signs; **`verify`** recomputes the HMAC, compares it in constant time, then checks `exp`/`nbf`. It throws `TokenExpiredError` or `JsonWebTokenError` — your middleware collapses both into one 401.

**Registered claims to name:** `iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`. **You use only `iat`/`exp`** (added automatically) plus your custom `userId`. `jti` is the one that would let you build a revocation list; `aud`/`typ` is what would fix your reset-token confusion.

**Security facts to have ready:**
- JWTs are **signed, not encrypted** — anyone can decode the payload. (Encrypted variant = JWE.)
- The classic **`alg: none`** attack and the **RS256→HS256 confusion** attack were both fixed in jsonwebtoken v9 (it requires you to be explicit and rejects mismatches), but you should still pin `{ algorithms: ['HS256'] }` on verify. Saying "v9 protects me, and I'd pin the algorithm anyway" is the complete answer.
- **HS256 (symmetric)** = one secret, signer and verifier are the same party — right for a monolith. **RS256 (asymmetric)** = private key signs, public key verifies — right when many services verify tokens they didn't issue.

### D2. `bcryptjs` v3

**What bcrypt is:** a password-hashing function built on the Blowfish key schedule (EksBlowfish), deliberately slow, with a **cost factor** (yours: 10 → 2¹⁰ = 1024 iterations) and a **128-bit random salt** embedded in the output string: `$2b$10$<22-char salt><31-char hash>`. That's why you don't store the salt separately — `compare()` reads it back out of the hash.

**Why not SHA-256:** general-purpose hashes are fast by design, which helps the attacker. Modern GPUs do billions of SHA-256 per second; bcrypt at cost 10 is thousands.

**`bcryptjs` vs `bcrypt`:** yours is the **pure-JavaScript port** — no native compilation (deploys anywhere, no build toolchain on Render), roughly 3-5× slower than the native binding. Also note bcrypt **truncates input at 72 bytes**.

**Modern alternative:** **Argon2id** — memory-hard, so GPU/ASIC attacks are far more expensive. It's OWASP's current first recommendation; bcrypt remains acceptable.

### D3. `express-validator` v7

Wraps the `validator.js` library as Express middleware. Chains (`body('email').isEmail()`) run **before** your handler and record errors on the request; `validationResult(req)` collects them.

**Q: "Why validate at the edge?"** → so the handler can assume shape; one place to change rules; and errors get a consistent format. **Your gap:** you use it in `auth.js` but **not** on the search route, which is why `maxDuration:'abc'` and `page:0` cause silent bugs. Alternatives: **Zod** or **Joi** (schema-first, and Zod gives you TypeScript types for free).

---

## E. Infrastructure libraries

### E1. `cors`
Sets the `Access-Control-*` response headers and answers `OPTIONS` preflights. **The mental model:** the browser (not the server) enforces the same-origin policy; CORS headers are the server *telling the browser* to relax it. A request is "simple" (no preflight) only with GET/HEAD/POST, safe headers, and a `Content-Type` of `text/plain`, `multipart/form-data` or `application/x-www-form-urlencoded`. **Yours is not simple** — custom header + JSON content type — so every search costs an extra `OPTIONS` round-trip. Fix: `maxAge` to cache the preflight; replace `origin:'*'` with an allow-list; drop `credentials` (it's contradictory with `*`).

### E2. `dotenv`
Reads `.env` into `process.env` at startup. Two facts: it **does not override** variables already set in the environment (so Render's dashboard values win, which is what you want), and it should be required **first**, before any module that reads config at import time — yours is, on line 1 of `index.js`. In production you generally don't ship a `.env` at all; you use the platform's secret store.

### E3. `nodemailer` + `nodemailer-sendgrid-transport`
Nodemailer is the mail-sending abstraction; the transport plugin makes it talk to SendGrid's HTTP API instead of raw SMTP. **Why a transactional provider instead of SMTP from your server:** deliverability. Providers manage IP reputation, SPF/DKIM/DMARC alignment, bounce and complaint handling — mail sent directly from a cloud VM lands in spam or is blocked outright. **In your code** the transporter is created once at module load (correct — reuses the HTTPS agent), but `SENDGRID_API_KEY` is absent from `.env`, so `sendMail` would reject. Also: email is a slow, failure-prone external call sitting **inside a request** — it belongs on a queue with retries.

---

## F. The algorithm library

### `js-priority-queue` v0.1.5
A JS priority queue whose default strategy is a **binary heap** — a complete binary tree stored in an array where every parent ≤ its children (for a min-heap). `queue()` appends and **sifts up**; `dequeue()` takes the root, moves the last element to the root and **sifts down**. Both O(log n); peek is O(1); building from n items via heapify is O(n).

You pass a **comparator** — that's the Strategy pattern, and it's what encodes your (legs, fare) ranking.

**Two things to be ready for:**
1. **"Why not just sort an array?"** → Insertion into a sorted array is O(n) because of shifting; a heap is O(log n), and you're interleaving pushes and pops constantly.
2. **"This package is unmaintained."** → True — it's on 0.1.x and years old. `tinyqueue` (also in your `package.json`, unused) is the modern minimal alternative, or a 30-line heap of your own. Be ready to **write a binary heap on a whiteboard** — it's a very common follow-up once you say "priority queue".

---

## G. The unused dependencies — how to answer without flinching

These are in `Back_end/package.json` and imported **nowhere**. An interviewer scanning your manifest will ask.

| Package | What it actually is | The one-line answer |
|---|---|---|
| **`puppeteer`** | Headless Chrome automation over the DevTools Protocol; renders JS-heavy pages | "Leftover from an abandoned plan to scrape live timetables. It downloads a ~300 MB Chromium into every deploy — it should be removed." |
| **`cheerio`** | jQuery-like server-side HTML parsing (static HTML only, no JS execution) | Same origin story — the lightweight half of the scraping plan |
| **`axios`** (backend) | HTTP client | Would have been the fetcher for that scraping/API work; the backend makes no outbound HTTP calls except SendGrid via nodemailer |
| **`indian-rail-api`** | A third-party wrapper around unofficial Indian Railways endpoints | "The intended real data source. I never integrated it, so the app runs on seeded data — and I'd want to check its licensing and reliability before depending on it." |
| **`node-cron`** | In-process cron scheduler | Planned periodic timetable refresh. Note the gotcha you should mention: **in-process schedulers fire once per instance**, so with N replicas the job runs N times — you need a distributed lock or an external scheduler |
| **`tinyqueue`** | A ~50-line binary heap | Evaluated as an alternative to `js-priority-queue`; never swapped in |

**The framing that works:** *"Those are dead dependencies from a scraping approach I abandoned. They're unused code that still ships, still enlarges the deploy, and still counts for supply-chain risk — `npm audit` plus removing them is a five-minute fix I should have done."* Turning it into a supply-chain-hygiene answer beats apologising.
---

## H. React 19

**The mental model:** React is a declarative UI library. You describe what the UI should look like for a given state; React computes the difference against the previous render and applies the minimum DOM mutations. You never touch the DOM yourself.

### H1. Rendering and reconciliation
- A render produces a **virtual DOM** tree. React **diffs** it against the previous tree using an O(n) heuristic (a general tree-diff would be O(n³)) built on two assumptions: **different element types produce different trees**, and **keys identify children across renders**.
- **`key` is the one that gets asked.** With `key={idx}` (your `SearchExperience.js:217`), React matches children by position — so if the list reorders or items are removed, React reuses the wrong DOM node and component state sticks to the wrong row. With a stable key (a route hash, a train number) it moves nodes correctly.
  > "I used the array index as the key, which is only safe for a static, append-only list. My results list is replaced wholesale on each search *and* animated with `AnimatePresence`, so index keys can produce wrong exit animations and reused nodes. A stable key derived from the itinerary would fix it."
- **`react-dom/client`'s `createRoot`** (your `index.js`) is the React 18+ concurrent entry point, replacing `ReactDOM.render`.

### H2. Hooks — the rules and the reasons
- **Rules:** only at the top level (never in conditions or loops) and only in components/custom hooks. **Why:** hooks are stored per component in an ordered list; React identifies them by call order, so a conditional hook desynchronises the list.
- **`useState`** — setter triggers a re-render; **batched** in React 18+ (including inside promises and timeouts, unlike React 17). Use the functional form `setX(prev => …)` when the next value depends on the previous.
- **`useEffect`** — runs *after* paint. Dependency array: `[]` = once on mount, `[x]` = when `x` changes, omitted = every render. **Return a cleanup function** for subscriptions/timers/aborts. In `StrictMode` in development, effects run **twice** on mount deliberately, to surface missing cleanup.
  - Your `SettingsExperience.js:57` effect syncs a body class on mount — a legitimate use (an external system outside React's control).
  - Your `App.js:19` effect (`if (!token) localStorage.removeItem("token")`) is effectively a no-op — a fair thing to concede.
- **`useMemo`/`useCallback`** — memoise a value / a function identity. You use neither; at ten rows that's correct, and "I didn't need it" is a better answer than premature memoisation.
- **`useRef`** — a mutable box that doesn't trigger renders; also the DOM handle.
- **`useContext`** — the fix for your token being passed down as a prop.

### H3. What's actually new in React 19 (asked because you're on it)
- **`ref` is now a regular prop for function components** — `forwardRef` is no longer required (it still works, and is deprecated-ish going forward). Your `components/ui/*` use `forwardRef`, which is the React 18 idiom.
  > **A great line:** "I used `forwardRef` out of habit from React 18. In 19, `ref` is just a prop, so those wrappers could be simplified — the *reason* they exist doesn't change, which is that a design-system primitive must let the parent reach the DOM node."
- **Actions / `useActionState` / `useFormStatus` / `useOptimistic`** — built-in async form state with pending and error handling. Your `AuthPage` hand-rolls `loading` and `error` state; that's exactly what Actions replace.
- **`use()`** — read a promise or context conditionally during render.
- **Better hydration errors, ref cleanup functions, and `defaultProps` removed for function components** (use default parameters).
- React 19 also enables the **React Compiler** ecosystem (auto-memoisation), though it's opt-in tooling.

### H4. Controlled vs uncontrolled
Your inputs are **controlled**: React state is the single source of truth, `value` + `onChange` on every field. Pros: validation, formatting and conditional logic are trivial; the UI can't drift from state. Cons: a re-render per keystroke, and boilerplate. **Uncontrolled** (refs / `FormData`) is faster for big forms — that's what `react-hook-form` exploits.

**Q: "Why is your whole form one state object?"** → §Q24 of the main guide.

### H5. What's missing in your React that they'll ask about
- **No error boundary** — a render error blanks the entire app (error boundaries are still class components, or `react-error-boundary`).
- **No `AbortController`** on searches → a fast double-submit races; whichever response lands last wins, even if it's the stale one.
- **No code splitting** — `React.lazy` + `Suspense` around the authenticated pages would cut the initial bundle.
- **No cross-tab sync** — a `storage` event listener would keep the token consistent across tabs.

---

## I. react-router-dom v7

**Client-side routing:** the router intercepts navigation, uses the **History API** (`pushState`) to change the URL without a server request, and renders the matching component. Zero network round-trip on navigation — that's the SPA trade.

**What you use:** `BrowserRouter` (declarative mode), nested `<Route>` with a **layout route** (`AppLayout` renders `<Outlet/>` — the child renders inside the parent, and the parent doesn't remount on navigation, which is what makes your sidebar persistent and your page transitions work), `useNavigate`, `useLocation`, `<Link>`, and `<Navigate>` for the redirect in `PrivateRoute`.

**Three things worth knowing:**
1. **`BrowserRouter` vs `HashRouter`:** clean URLs vs `#/path`. Browser mode requires **server-side support** — see the deployment gotcha below.
2. **`<Link>` vs `<a>`:** `<a>` triggers a full page reload, destroying app state and re-downloading the bundle. That's the classic SPA interview question.
3. **v7 specifics:** it merged with Remix; there are now three modes — declarative (yours), data (`createBrowserRouter` with loaders/actions), and framework. Data mode's **loaders** fetch *before* render, eliminating the loading-spinner waterfall; that's the modern answer to "how would you improve your data fetching?"

**⚠️ The deployment gotcha you should check right now:** with `BrowserRouter`, if a user hits `https://yoursite/search` directly or refreshes on that URL, the **static host** looks for a file at `/search`, doesn't find one, and returns **404** — unless you configure a rewrite of all paths to `/index.html`. On Render that's a **Redirect/Rewrite rule: Source `/*` → Destination `/index.html`, Action: Rewrite**. If you've never tested a hard refresh on `/search` in production, test it before the interview — and either way, this is an excellent thing to volunteer as "a deployment detail SPAs get wrong."

---

## J. Create React App / react-scripts 5 / webpack

**What CRA is:** a zero-config wrapper around **webpack 5**, **Babel**, ESLint, Jest and a dev server. `react-scripts` hides the config until you `eject`.

**The build:** Babel transpiles JSX and modern syntax → webpack walks the import graph, bundles, tree-shakes, minifies (Terser) and emits **content-hashed** files (`main.[contenthash].js`) so browsers can cache them forever and still get updates.

**Environment variables — the question that gets asked:** only variables prefixed `REACT_APP_` are exposed, and webpack's `DefinePlugin` performs a **literal text substitution at build time**. So `process.env.REACT_APP_API_URL` becomes a hardcoded string in your bundle.
> **Say this:** "It's baked in at build time, not read at runtime — changing my backend URL means a rebuild and redeploy, not a restart. And it means **nothing secret can ever go in a `REACT_APP_` variable**, because it ships to every browser. Mine only holds the API base URL, which is fine."

**The `proxy` field** in your `package.json` (`"proxy": "http://localhost:5000"`) tells the **dev server** to forward unmatched requests to your backend, avoiding CORS in development. It has **no effect in production**, and in your case it's unused anyway because you call an absolute `API_URL`.

**Q: "Why not Vite or Next?"**
> "CRA was zero-config and my app is a pure client-rendered SPA behind a login, so SSR and SEO don't matter. But CRA is effectively unmaintained — the React docs no longer recommend it — and its cold builds are slow. Vite would give me near-instant HMR via native ESM in dev and Rollup in prod. Next.js would give me SSR/SSG, file-based routing and API routes, at the cost of a server and more framework. For a rebuild today I'd pick Vite."

---

## K. Tailwind CSS 3.4 + PostCSS + autoprefixer

**Tailwind** is a utility-first CSS framework: you compose atomic classes (`flex`, `h-14`, `text-white`) instead of writing semantic CSS. **The JIT engine** scans the files listed in `content` (`./src/**/*.{js,jsx,ts,tsx}` in your `tailwind.config.js`) and generates **only** the classes it finds, so the shipped CSS is small regardless of how big Tailwind is.

**The gotcha to know:** because it's a **static text scan**, dynamically constructed class names (`` `text-${color}-500` ``) are never generated. Always write complete class strings; that's why variant **maps** (your `Button.js`) are the correct pattern.

**Your config** extends the theme with design tokens — `deep-navy`, `electric-blue`, `cyan`, `emerald-green`, `dark-card`, plus a `float` keyframe. That's the right way to do a design system: tokens in config, not hex codes scattered in components.

**PostCSS** is the CSS build pipeline; Tailwind and **autoprefixer** are plugins in it (`postcss.config.js`). Autoprefixer adds vendor prefixes based on your `browserslist`.

**`@layer base/components/utilities`** in `index.css` controls where your custom CSS lands in the cascade so Tailwind's utilities can still override your component classes.

**Q: "Why Tailwind over CSS modules or styled-components?"**
> "Speed and consistency — tokens live in one config, there's no naming overhead, and dead CSS can't accumulate because unused utilities are never generated. The costs are noisy JSX and a learning curve. I also needed `tailwind-merge` to resolve conflicting utilities when a parent passes `className`, which is a real complexity tax."

---

## L. MUI 7 + Emotion — and why having both is a problem

**MUI** is a component library implementing Material Design; it styles with **Emotion**, a CSS-in-JS library that generates class names at **runtime** and injects `<style>` tags.

**In your app:** `index.js` wraps everything in `ThemeProvider` + `CssBaseline` with a theme defining a blue primary and Roboto — and then **essentially nothing uses it**, because the UI is Tailwind with a neon dark palette.

**The three criticisms to own:**
1. **Bundle weight** for a library you don't render.
2. **Two CSS resets** — MUI's `CssBaseline` and Tailwind's Preflight both normalise the DOM; running both is redundant and can produce surprises.
3. **Runtime cost** — CSS-in-JS does work in the browser on every render; Tailwind's output is a static stylesheet.

> "Two styling systems plus a 7 KB `App.css` that isn't even imported. I'd delete MUI and Emotion, keep Tailwind, and measure the bundle before and after with `source-map-explorer`."

---

## M. framer-motion 12

Declarative animation for React. You use `initial` / `animate` / `exit` / `transition`, `whileHover` / `whileTap`, `<AnimatePresence>` (which keeps a component mounted long enough to run its exit animation — impossible with plain CSS when React unmounts it immediately), and **`layoutId`** in `Sidebar.js`, which animates a shared element between positions using the **FLIP** technique (measure First and Last positions, apply an Invert transform, then Play it away).

**Performance note to have ready:** framer animates `transform` and `opacity`, which are GPU-composited and don't trigger layout or paint — unlike animating `width`/`top`. **Your own bug:** `transition={{ delay: idx * 0.1 }}` on the results list means the tenth card appears a full second after the first, and with `limit=50` the last appears after five seconds. Cap the total stagger.

---

## N. axios vs fetch — and why using both is a smell

| | `fetch` | `axios` |
|---|---|---|
| Built in | ✅ native | ❌ ~13 KB |
| Rejects on 4xx/5xx | **No** — you must check `res.ok` | **Yes** — non-2xx throws |
| JSON | manual `res.json()` | automatic |
| Interceptors | none | ✅ request/response |
| Timeout / cancel | `AbortController` | built-in `timeout`, `AbortController` |
| Upload progress | ❌ | ✅ |

**In your code:** `AuthPage.js` uses `fetch`, `SearchExperience.js` uses `axios`. That's why your error handling differs between the two — `fetch` doesn't throw on a 400, so `AuthPage` reads `data.msg` from the body, while axios throws and `SearchExperience` reads `err.response.data.message`.

> "I'd standardise on one — axios, because interceptors are exactly what I'm missing: a request interceptor to attach `x-auth-token` in one place instead of per call, and a response interceptor to catch 401s globally, clear the token and redirect. That single change fixes my expired-token UX."

---

## O. The small ones (know them in one line each)

- **`clsx`** — conditionally joins class names into a string.
- **`tailwind-merge`** — resolves *conflicting* Tailwind utilities so the last wins (`h-12` + `h-14` → `h-14`). Together in your `cn()`.
- **`lucide-react`** — SVG icon components (a maintained fork of Feather). Tree-shakeable when imported by name, as you do.
- **`web-vitals`** — measures Core Web Vitals. **Yours is v2 and unused:** `reportWebVitals.js` is never imported, and it calls the old `getCLS`/`getFID` API (v3+ renamed these to `onCLS`/`onLCP`, and **FID was replaced by INP** as a Core Web Vital in 2024). If asked: "dead CRA scaffolding on an outdated API."
- **`nodemon`** — dev-only file watcher that restarts the server on change (`npm run dev`).
- **The current Core Web Vitals**, in case they come up: **LCP** (loading), **INP** (responsiveness, replaced FID), **CLS** (visual stability).

---

## P. Testing tooling

- **Jest** — the runner CRA configures (jsdom environment, snapshot support, built-in mocking via `jest.mock`).
- **React Testing Library** — queries the DOM the way a user would (`getByRole`, `getByText`) rather than reaching into component internals. Its philosophy: *test behaviour, not implementation.* `getBy` throws when missing, `queryBy` returns null (use it to assert absence), `findBy` is async.
- **`@testing-library/jest-dom`** — the extra matchers (`toBeInTheDocument`, `toHaveTextContent`) — imported in your `setupTests.js`.
- **`@testing-library/user-event`** — realistic interaction simulation (a click that also fires focus, mousedown, mouseup).
- **What you'd add:** **supertest** for HTTP-level API tests, **mongodb-memory-server** for a real in-process Mongo, **MSW** to mock the network at the boundary in frontend tests, **Playwright** for one end-to-end smoke test.

---

## Q. Deployment: Render

- **Static Site** (frontend): build `npm run build`, publish `build/`. Served from a CDN. **Needs a rewrite rule `/*` → `/index.html`** for client-side routing (see §I).
- **Web Service** (backend): build `npm install`, start `npm start` (which runs `node index.js`). Render sets `PORT` in the environment — your `process.env.PORT || 5000` handles that correctly, and hardcoding a port is a classic deploy failure.
- **Free tier spins down after ~15 minutes of inactivity** → the next request pays a cold start of 30+ seconds while the container boots and Mongo reconnects. Your frontend has no timeout or retry handling for that, and it's the most likely thing to embarrass you in a live demo. **Warm it up before you present.**
- Environment variables live in the dashboard, which is where your secrets should be (and not in a `.env` on disk).
- No Docker, no CI, no staging, no health check beyond `GET /` returning a string that doesn't verify the database.

**Q: "How would you improve the deployment?"**
> "A Dockerfile with a multi-stage build so the image is reproducible and small; GitHub Actions running lint, tests and `npm audit`, deploying only on green; a staging environment; a real `/health` readiness probe that pings Mongo; and a rollback path. And I'd remove the unused dependencies — `puppeteer` alone is downloading a Chromium into every build."

---

## R. Concepts *around* the stack you should be fluent in

**HTTP:** methods and their semantics (GET safe + idempotent, POST neither, PUT idempotent, PATCH partial, DELETE idempotent); status codes (200/201/204, 301 vs 302, 400/401/403/404/409/422/429, 500/502/503/504) — note **401 = not authenticated, 403 = authenticated but not allowed**, and that your API only ever uses 401; headers (`Content-Type`, `Authorization`, `Cache-Control`, `ETag`); HTTP/1.1 keep-alive vs HTTP/2 multiplexing.

**The browser:** same-origin policy (an origin is scheme + host + port), CORS as the server's opt-out, `localStorage` vs `sessionStorage` vs cookies (size, expiry, `httpOnly`, `SameSite`), the critical rendering path.

**TLS:** what HTTPS gives you (confidentiality, integrity, server authentication) and what it doesn't (it doesn't protect anything once the data is in the browser — which is why your `localStorage` token is still XSS-exposed).

**Databases in general:** ACID; the CAP theorem (and that MongoDB with a replica set is CP — during a partition it prefers consistency and the minority side stops accepting writes); normalisation vs denormalisation; optimistic vs pessimistic concurrency; index tradeoffs (faster reads, slower writes, more storage).

---

## S. The 10 things to actually memorise about this stack

1. **Node is single-threaded for JS**; I/O is offloaded to libuv. Your CPU risks are bcrypt and the traversal.
2. **Express 5 auto-forwards async errors** — but you have no error middleware, so every handler try/catches.
3. **Mongo indexes are B-trees**; you need a **compound** `{source, destination, dateOfJourney}`, and two single-field indexes are not equivalent to one compound.
4. **`.lean()`** skips hydration — the right call on a read-only traversal.
5. **JWTs are signed, not encrypted**, HS256 = HMAC-SHA256, and stateless means **no revocation**.
6. **bcrypt is deliberately slow and salted**; cost 10 = 1024 rounds; `bcryptjs` is the pure-JS, slower port.
7. **A binary heap gives O(log n) push/pop** — be ready to write one.
8. **`REACT_APP_*` is inlined at build time** — never a secret, and a URL change needs a rebuild.
9. **Tailwind's JIT is a static text scan** — no dynamic class names, hence variant maps.
10. **`BrowserRouter` needs a server rewrite to `/index.html`**, or deep links 404 in production.

---

## T. Rapid-fire drill (45 questions, one-line answers)

Cover the right-hand column and work down. Anything you miss twice, go read that section.

| # | Question | Answer |
|---|---|---|
| 1 | What is the event loop? | The loop that runs callbacks for completed async work on Node's single JS thread |
| 2 | Blocking vs non-blocking? | CPU work holds the thread; I/O is handed to the OS and yields |
| 3 | Microtask vs macrotask? | Promises drain between phases; timers/IO are phases — promises win |
| 4 | Why does bcrypt hurt Node? | It's real CPU, ~50-100 ms, and CPU is not offloaded |
| 5 | `worker_threads` vs `cluster`? | Threads share memory in one process; cluster forks processes per core |
| 6 | CommonJS vs ESM? | `require` is sync and cached; `import` is static and tree-shakeable |
| 7 | What does `^1.2.3` allow? | Any 1.x.x ≥ 1.2.3 |
| 8 | `npm ci` vs `npm install`? | `ci` installs strictly from the lockfile; `install` may update it |
| 9 | What is middleware? | `(req,res,next)` in a pipeline — inspect, respond, or pass on |
| 10 | Express 5's headline change? | Async rejections auto-forward to the error handler |
| 11 | How do you write an error handler? | Middleware with 4 args: `(err, req, res, next)` |
| 12 | `app.use` vs `router.post`? | Prefix + all methods vs exact path + one method |
| 13 | What is BSON? | Binary JSON with extra types — ObjectId, Date, Decimal128 |
| 14 | What's inside an ObjectId? | Timestamp + random + counter — roughly time-sortable |
| 15 | What structure is a Mongo index? | A B-tree |
| 16 | Compound index prefix rule? | `{a,b,c}` serves a, a+b, a+b+c — not b alone |
| 17 | ESR rule? | Equality, then Sort, then Range fields in the index |
| 18 | IXSCAN vs COLLSCAN? | Index scan vs reading every document |
| 19 | What does `.lean()` do? | Returns plain objects, skipping Mongoose hydration |
| 20 | Is `unique: true` a validator? | No — it declares a unique index |
| 21 | What does Mongoose casting protect against? | NoSQL operator injection into typed paths (as a side effect) |
| 22 | What is a replica set? | Primary + secondaries replicating via the oplog, with automatic failover |
| 23 | Mongo and CAP? | CP — during a partition the minority stops taking writes |
| 24 | JWT structure? | header.payload.signature, base64url |
| 25 | HS256 vs RS256? | Shared secret vs private-key sign / public-key verify |
| 26 | Are JWTs encrypted? | No — signed. Anyone can read the payload |
| 27 | How do you revoke a JWT? | You can't directly — short TTL + deny-list or tokenVersion |
| 28 | Why bcrypt over SHA-256? | Deliberately slow and salted; fast hashes help attackers |
| 29 | What does cost 10 mean? | 2¹⁰ = 1024 key-derivation rounds |
| 30 | Where's the salt stored? | Inside the hash string itself |
| 31 | Modern alternative to bcrypt? | Argon2id — memory-hard |
| 32 | What triggers a CORS preflight? | Non-simple requests — custom headers, JSON content type |
| 33 | Who enforces the same-origin policy? | The browser, not the server |
| 34 | Binary heap push/pop complexity? | O(log n); peek O(1); heapify O(n) |
| 35 | Why a heap over a sorted array? | Insert is O(log n) vs O(n) |
| 36 | Why are React keys important? | They identify children across renders in the diff |
| 37 | Why is `key={index}` risky? | Reorders/removals reuse the wrong DOM node and state |
| 38 | Why must hooks be top-level? | They're matched by call order per component |
| 39 | What changed for refs in React 19? | `ref` is a normal prop — `forwardRef` no longer required |
| 40 | Controlled vs uncontrolled input? | State is the source of truth vs the DOM is |
| 41 | When is `REACT_APP_*` resolved? | At build time, inlined by webpack |
| 42 | `<Link>` vs `<a>`? | Client-side navigation vs a full page reload |
| 43 | Why does `/search` 404 on refresh? | Static host has no such file — needs a rewrite to `/index.html` |
| 44 | Why is Tailwind's output small? | JIT generates only the classes found in a static scan |
| 45 | fetch vs axios on a 400? | fetch resolves (check `res.ok`); axios throws |
