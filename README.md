# Expense Tracker (MERN Stack)

A full-stack expense tracker with JWT authentication, income/expense management,
dashboard analytics (Recharts), Excel export, and profile picture uploads.

```
expense-tracker/
├── backend/     Node.js + Express + MongoDB (Mongoose) API
└── frontend/    React (Vite) + React Router + Axios + plain CSS3
```

## Features

- Sign up, log in, log out with JWT auth (bcrypt-hashed passwords)
- Protected dashboard — all app routes require a valid token
- Add / edit / delete / view income and expense transactions
- Search, filter by category, sort, and paginate transactions
- Dashboard cards: Total Balance, Total Income, Total Expense, Recent Transactions
- Charts (Recharts): Income vs Expense, Expense by Category (pie), Last 30 Days Expenses,
  plus a monthly trend line and top-categories view on the Analytics page
- Export transactions to an Excel (.xlsx) file
- Upload / update profile picture, editable display name
- Toast notifications (react-hot-toast) for auth, CRUD, and profile actions
- Responsive, animated UI built with plain CSS3 (no UI framework)

---

## 1. Local setup

### Prerequisites
- Node.js 18+
- A MongoDB database — either a local `mongod` instance or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Backend

```bash
cd backend
cp .env.example .env    # then fill in the values below
npm install
npm run dev              # nodemon, http://localhost:5000
```

**`backend/.env` variables**

| Variable         | Description                                                       | Example                                          |
|------------------|---------------------------------------------------------------------|---------------------------------------------------|
| `MONGO_URI`      | MongoDB connection string                                          | `mongodb+srv://user:pass@cluster.mongodb.net/expense_tracker` |
| `JWT_SECRET`     | Long random string used to sign JWTs                               | `openssl rand -base64 48`                          |
| `JWT_EXPIRES_IN` | Token lifetime                                                     | `7d`                                               |
| `PORT`           | Port the API listens on                                            | `5000`                                             |
| `CLIENT_URL`     | Allowed CORS origin(s), comma-separated for multiple                | `http://localhost:5173,https://your-app.vercel.app` |

### Frontend

```bash
cd frontend
cp .env.example .env     # then fill in the value below
npm install
npm run dev               # http://localhost:5173
```

**`frontend/.env` variables**

| Variable       | Description                    | Example                          |
|----------------|---------------------------------|-----------------------------------|
| `VITE_API_URL` | Base URL of the backend API     | `http://localhost:5000/api`       |

Open `http://localhost:5173`, sign up, and start adding transactions.

---

## 2. Deploying so anyone can sign up and use it

Your frontend is a static Vite build, so **Vercel is a great fit for it**. Your backend,
however, is a stateful Express server that writes uploaded profile pictures to local disk —
that needs a host with a persistent filesystem and a long-running Node process
(**Render, Railway, or Fly.io** are the easiest). Vercel's serverless functions use an
ephemeral filesystem, so files saved by `multer` there will disappear between requests;
don't deploy the backend itself to Vercel unless you first swap avatar storage for a
cloud bucket (S3, Cloudinary, etc.) — the rest of the API works fine as serverless functions.

### Step 1 — Database: MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and password.
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so your host can connect.
4. Copy the connection string — this is your `MONGO_URI`.

### Step 2 — Backend: Render (or Railway / Fly.io)
1. Push this repo to GitHub.
2. On [render.com](https://render.com), create a **New Web Service** pointing at the
   `backend` folder (Root Directory: `backend`).
3. Build command: `npm install` — Start command: `npm start`.
4. Add environment variables from the table above:
   - `MONGO_URI` → your Atlas connection string
   - `JWT_SECRET` → a long random string
   - `JWT_EXPIRES_IN` → `7d`
   - `CLIENT_URL` → your Vercel URL, e.g. `https://your-app.vercel.app` (add it now with a
     placeholder, you'll get the real URL in Step 3 — just redeploy after updating it)
   - `PORT` → Render sets this automatically; you can omit it
5. Deploy. Note the resulting API URL, e.g. `https://expense-tracker-api.onrender.com`.

### Step 3 — Frontend: Vercel
1. On [vercel.com](https://vercel.com), import the same repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist`
   (Vercel detects these automatically for Vite).
4. Add an environment variable:
   - `VITE_API_URL` → `https://expense-tracker-api.onrender.com/api` (your Render URL + `/api`)
5. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

### Step 4 — Connect the two
Go back to Render, update `CLIENT_URL` to your real Vercel URL (comma-separate if you also
want to keep `http://localhost:5173` for local dev), and redeploy the backend. This is the
key step — without it, the API will reject requests from your deployed frontend and nobody
will be able to log in.

### Step 5 — Verify
Visit your Vercel URL, sign up for a new account, add a transaction, and confirm it appears
on the dashboard. If sign up/login fails, check your browser console/network tab first —
it's almost always one of:
- `VITE_API_URL` missing the `/api` suffix, or pointing at the wrong host
- `CLIENT_URL` on the backend not matching your exact Vercel URL (must include `https://`,
  no trailing slash)
- `MONGO_URI` not reachable (check Atlas Network Access) or wrong credentials
- The Render free-tier service was asleep — the very first request after idling can take
  ~30–50 seconds to respond, which can look like a hang rather than an error

---

## 3. API overview

All endpoints are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Method | Route                     | Description                          | Auth |
|--------|----------------------------|---------------------------------------|------|
| POST   | `/auth/signup`             | Create account                        | —    |
| POST   | `/auth/login`               | Log in, returns JWT                   | —    |
| GET    | `/auth/me`                  | Get current user                      | ✅   |
| PUT    | `/auth/profile`             | Update display name                   | ✅   |
| POST   | `/auth/avatar`              | Upload/replace profile picture        | ✅   |
| GET    | `/transactions`             | List (search/filter/sort/paginate)    | ✅   |
| POST   | `/transactions`             | Create transaction                    | ✅   |
| GET    | `/transactions/:id`         | Get single transaction                | ✅   |
| PUT    | `/transactions/:id`         | Update transaction                    | ✅   |
| DELETE | `/transactions/:id`         | Delete transaction                    | ✅   |
| GET    | `/transactions/summary`     | Totals, category breakdown, recents   | ✅   |
| GET    | `/transactions/export`      | Download transactions as .xlsx        | ✅   |

## Tech stack
- **Frontend:** React 18 (Vite), React Router 6, Axios, Recharts, react-hot-toast, CSS3
- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs, multer, xlsx,
  express-validator, dotenv, cors
