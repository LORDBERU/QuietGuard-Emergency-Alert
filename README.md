# QuietGuard

**Ambient-sound-based emergency alerts for older adults and hearing-impaired users.**

QuietGuard helps a monitored user notify a trusted contact when they press an emergency alert button or the browser detects a selected danger sound (smoke alarm, glass breaking, distress shout, or loud impact).

---

## Table of Contents
1. [How It Works](#how-it-works)
2. [Important Limitations](#important-limitations)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Email Provider Setup (Resend)](#email-provider-setup-resend)
7. [Deploy on Render](#deploy-on-render)
8. [Audio Detection Notes](#audio-detection-notes)
9. [Project Structure](#project-structure)

---

## How It Works

1. **Sign up** and add your trusted contact's name and email.
2. **Start Monitoring** — the app requests microphone access and loads the YAMNet AI model.
3. Audio is **processed entirely on your device** — no recordings are ever uploaded.
4. If a danger sound is detected above your configured confidence threshold (and confirmed across multiple windows), the backend sends an email to your trusted contact.
5. You can also press **Send Emergency Alert** at any time to immediately notify your contact.
6. All events are saved to your **Alert History**.

---

## Important Limitations

> **QuietGuard is a web application, not a native app. It has significant monitoring limitations you must understand before relying on it.**

- **Tab must be open and active.** Monitoring stops when you switch tabs, minimize the browser, or lock your screen.
- **No background monitoring.** A normal website cannot access the microphone when it is not in the foreground.
- **No guaranteed always-on listening.** For reliable 24/7 monitoring, a native iOS or Android app would be required.
- **Not a replacement for emergency services.** Always call 911 (or your local emergency number) for life-threatening situations.
- **Fall detection is experimental.** The "Loud Impact" category uses an audio impact heuristic — it may trigger on any loud thud, not specifically falls.
- **AI accuracy varies.** Smoke alarm detection is most reliable. Distress voice and impact sounds have higher false-positive and false-negative rates.

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/quietguard.git
cd quietguard
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your local values
npm install
```

### 3. Frontend setup

```bash
cd ../frontend
cp .env.example .env
npm install
```

### 4. Start both services

In terminal 1 (backend):
```bash
cd backend
npm run dev
```

In terminal 2 (frontend):
```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

---

## Environment Variables

### Backend (set in `backend/.env` locally, or Render Dashboard for production)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/quietguard` |
| `SESSION_SECRET` | Long random string for signing sessions | `openssl rand -hex 32` |
| `RESEND_API_KEY` | Your Resend API key | `re_xxxxxxxxxxxx` |
| `ALERT_FROM_EMAIL` | From address for alert emails | `alerts@yourdomain.com` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `https://quietguard-frontend.onrender.com` |
| `PORT` | Port to listen on | `3001` |
| `NODE_ENV` | `development` or `production` | `production` |

### Frontend (set in `frontend/.env.local` locally, or Render Dashboard for production)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend URL (leave empty to use Vite proxy in dev) | `https://quietguard-backend.onrender.com` |

> ⚠️ **Never commit `.env` files or real secrets.** Both are covered by `.gitignore`.

---

## Database Setup

### Local

```bash
# Create the database
createdb quietguard

# Run the migration
cd backend
npm run db:migrate
```

### On Render

The `render.yaml` blueprint provisions a PostgreSQL database automatically. After deploy:

1. The `DATABASE_URL` is injected automatically from the Render database.
2. Run migrations by connecting to the database and executing:
   ```bash
   psql $DATABASE_URL -f drizzle/migrations/0000_init.sql
   ```
   Or use the Render Shell to run the migration command.

---

## Email Provider Setup (Resend)

QuietGuard uses [Resend](https://resend.com) for transactional email. Email is sent only from the backend — no client-side email keys.

1. Sign up at [resend.com](https://resend.com) (free plan: 3,000 emails/month).
2. Verify your sending domain (or use the Resend sandbox for testing).
3. Create an API key.
4. Set `RESEND_API_KEY=re_xxxxxxxxxxxx` in your environment.
5. Set `ALERT_FROM_EMAIL=alerts@yourdomain.com` (must match your verified domain).

**Sandbox testing:** Resend's sandbox mode lets you send test emails without a verified domain. The recipient must be your own Resend account email in sandbox mode.

---

## Deploy on Render

### Blueprint deploy (recommended)

1. Push your code to GitHub (private repo: `quietguard`).
2. Log in to [render.com](https://render.com).
3. Click **New → Blueprint**.
4. Connect your GitHub repo.
5. Render reads `render.yaml` and provisions:
   - `quietguard-backend` (Node.js web service)
   - `quietguard-frontend` (Static site)
   - `quietguard-db` (PostgreSQL database)
6. After initial deploy, **set these secrets manually** in the Render Dashboard under each service's Environment tab:
   - `SESSION_SECRET` — generate with: `openssl rand -hex 32`
   - `RESEND_API_KEY` — from your Resend account
   - `ALERT_FROM_EMAIL` — your verified sending address
   - `FRONTEND_ORIGIN` — the deployed frontend URL (e.g., `https://quietguard-frontend.onrender.com`)

> ⚠️ Render's free PostgreSQL database has a **90-day expiry**. Upgrade to a paid plan for production use.

### Manual database migration on Render

After your backend service is deployed:
1. Go to Render Dashboard → `quietguard-backend` → **Shell**.
2. Run: `npm run db:migrate`

### CORS configuration

Set `FRONTEND_ORIGIN` on the backend service to the exact URL of your deployed frontend (no trailing slash). This is the only allowed CORS origin in production.

---

## Audio Detection Notes

### YAMNet model

QuietGuard uses [YAMNet](https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1), a TensorFlow.js audio classification model, loaded directly from TF Hub in the browser.

- **Input:** 16 kHz mono audio, 15,600 samples (≈0.975 seconds) per inference
- **Output:** 521 class probability scores
- **Relevant classes used:**
  - Smoke alarm: classes ~400–402
  - Glass breaking: class ~135
  - Distress sounds: classes ~75–77 (screaming, crying, shouting)
  - Loud impact: class ~463 (thud)
- **False positives:** All detections require a configurable confidence threshold AND 3 consecutive windows above threshold to reduce false positives.
- **Cooldown:** A per-event cooldown (default 5 minutes) prevents alert floods.

### What the app cannot do

- It cannot monitor when the browser tab is hidden, minimized, or on a locked screen.
- It cannot detect falls by audio with high reliability — "Loud Impact" is a heuristic only.
- It cannot guarantee any specific accuracy in real-world noise conditions.

### Demo mode

The dashboard includes a **Run Demo Detection [SIMULATED]** button. This triggers a fake detection event labeled `[SIMULATED]` everywhere — in the UI, in the alert history, and in any emails sent. It never uses the microphone.

---

## Project Structure

```
quietguard/
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── db/               # Drizzle ORM schema and client
│   │   ├── middleware/        # Auth, CSRF, rate limiting
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Email and alert dispatch
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Entry point
│   ├── drizzle/
│   │   └── migrations/        # SQL migration files
│   ├── drizzle.config.ts
│   └── package.json
├── frontend/                 # React/TypeScript/Vite SPA
│   ├── src/
│   │   ├── api/              # Typed API client wrappers
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # useAuth, useAudioMonitor, useAlerts
│   │   ├── pages/             # Route pages
│   │   ├── store/             # Zustand auth store
│   │   └── types/             # TypeScript interfaces
│   ├── vite.config.ts
│   └── package.json
├── render.yaml               # Render Blueprint deployment config
└── README.md
```

---

## Security Notes

- Passwords hashed with **Argon2id** (never stored in plaintext).
- Sessions stored server-side in PostgreSQL (not in localStorage).
- Cookies set with `HttpOnly`, `Secure`, `SameSite=Strict`.
- CSRF protection via double-submit token on all mutating requests.
- Rate limiting on login (10/15min per IP) and alerts (5/5min per user).
- Input validation with Zod on all backend endpoints.
- Ownership checks on all data access (users can only see their own data).
- No microphone audio is ever uploaded or stored.

---

## License

MIT
