# RepairShop OS — web

Single-page frontend for the [RepairShop OS backend](../repair-shop-api): the workshop, the
customers and their cars, the maintenance reminders and the mechanics' notebook, for car repair
garages. React 19, TypeScript, Vite, Ant Design 6, TanStack Query, in English and Serbian.
Firebase signs people in; the backend decides what they may do.

The structure, libraries and conventions are the same as the sibling `car-dealer-web`, which this
project started from.

---

## Status

| Area | State |
| --- | --- |
| Vite, TypeScript, ESLint, Prettier, absolute imports | done |
| Firebase sign-in, token refresh, session lost handling | done |
| `GET /auth/me`, onboarding through `POST /auth/bootstrap` | done |
| Permission-guarded routes, self-filtering sidebar, en / sr switch | done |
| Error model: branch on `code`, field violations, translations | done |
| **Dashboard**: what is in the shop, finished and earned this month, orders per month, cars coming up for service, latest orders | done |
| **Workshop**: the queue (in the shop / mine / all), opening an order with the parts prefilled from the service template (small: oil and the four filters; major: plus belts and water pump), part — quantity — price rows with + / − and a running total, status transitions with a reason on cancel | done |
| **Labour**: hours × rate with the cost following as you type, or "fixed price for the whole job" — which swaps the hours field for a required price | done |
| **Files on an order**: photographs of the fault, invoices, PDFs — uploaded straight to storage | done |
| **Quote and invoice** as a PDF, in the customer's language or the one asked for — an open order quotes, a finished one invoices — printed or emailed to the customer | done |
| **Vehicles**: list, register, edit, record a reading, the maintenance forecast and the reminders sent, service history | done |
| **Service book** on the car's page: every finished job with what it came to, printable and emailable to the customer | done |
| **Owners**: who has the car now and everybody before them, and handing it over with a date and a reason | done |
| **Customers**: list, detail with their cars, language per customer | done |
| **Notebook**: the mechanics' notes with files, searchable by make, model and text; editable by the author or an admin | done |
| **Garage settings**: service intervals (10 000 / 60 000 km by default), labour pricing, default language, contact, and the garage's logo — shown in the menu in place of its name | done |
| **Locations**: several per garage, opened and closed rather than deleted | done |
| Settings: users, invitations, roles, audit log; notification bell (polled) | done |
| Generated OpenAPI types | wired up, not yet generated — see _Types_ |

---

## Running it

Node 20 or newer, and the backend on `:8080`.

```bash
npm install
cp .env.example .env
npm run dev                  # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:8080`, so the browser stays on one origin and there is no
CORS preflight in development.

There is no mode in which this runs on its own: signing in needs the Auth emulator, and getting past
it needs the backend, because `/auth/me` is what decides whether the account exists. A full local
stack is four processes.

```bash
docker compose up -d                # 1. PostgreSQL, RabbitMQ, MinIO and Mailpit, in repair-shop-api
npm run emulator                    # 2. Firebase Auth on :9099
./gradlew :app:bootRun              # 3. the API on :8080 (see Firebase below)
npm run dev                         # 4. this application on :5173
```

Once, while the emulator is up: `npm run emulator:user` creates `test@example.com` /
`lozinka123`. The first sign-in lands on onboarding, which creates the garage with you as OWNER.

Other commands:

```bash
npm run build       # typecheck, then a production bundle in dist/
npm run typecheck
npm run lint
npm run format
npm run api:gen     # regenerate src/api/schema.d.ts from the backend's OpenAPI document
npm run emulator    # Firebase Auth emulator on :9099, UI on :4000
```

### Firebase

Signing in needs either the Auth emulator or a real Firebase project. **Both sides have to point at
the same one** — the backend verifies the tokens this app issues, and a mismatched project id is the
most common reason a sign-in succeeds but every API call still answers 401.

`firebase-tools` is a dev dependency, so nothing has to be installed globally. `.env.example` is
already configured for the emulator (`demo-repairshop`); the API key and auth domain in it are
deliberately fake, the emulator accepts any key. The backend joins the same emulator through its
git-ignored `app/src/main/resources/application-secrets.yml`:

```yaml
repairshop:
  firebase:
    project-id: demo-repairshop
    emulator-host: localhost:9099
```

For a real project, fill `.env` from *Project settings → Your apps → SDK setup* and leave
`VITE_FIREBASE_AUTH_EMULATOR_HOST` empty.

---

## How it is put together

```
src/
  api/          axios instance, error model, the API types (schema.d.ts once generated)
  auth/         Firebase, the session (status, user, can/canAny)
  components/   ErrorBlock, PageHeader, ProtectedRoute, ProtectedComponent
  hooks/        useQuery/useMutation (typed with AppError), useTableQuery, useDirectory
  lang/         i18next, en.json / sr.json, useEnumLabel, the language switch
  layout/       the shell: sidebar (filters itself by permission), header (bell, language, sign-out)
  routes/       the route registry — path, title, permissions — and AppRoutes
  features/     one folder per screen family: dashboard, workshop, vehicles, customers, notes, garage,
                roles, settings, notifications, auth, onboarding, errors
```

A feature folder has `pages/`, `components/`, `hooks/` and `utils/api.ts` (the calls and the query
keys). Mutations invalidate by key prefix, so a finished order refreshes the car's forecast and the
directory a form picks from.

### Uploads

Files never pass through the API. `POST …/attachments/upload-url` returns a signed URL; the browser
PUTs the bytes to storage (MinIO locally); then `POST …/attachments` registers the key. The row is
written last, so a failed upload leaves nothing behind. With no storage configured the rows still
list, without a link.

### Types

`src/api/types.ts` is a hand-written stand-in. With the backend running, `npm run api:gen` writes
`src/api/schema.d.ts` from `/v3/api-docs`; re-export from there and delete the stand-in when the
two are reconciled.

### Languages

Every string is in `src/lang/resources/en.json` and `sr.json`; backend codes are translated through
`useEnumLabel`. The choice is remembered per browser and also decides antd's locale and the
number/date formatting. The customer's own language (`en` / `sr`, on the customer record) is what
the backend writes emails and the quote in — it is separate from the UI language.
