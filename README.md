# Rejven Capital

A radically transparent trade-following site. Visitors create an account, then
follow your funds — live positions, performance charts, and a trade ledger.
An admin account can rename funds, edit holdings, add/remove portfolios, and log trades.

This is a Next.js app, so it runs outside any sandbox: live prices work, and you
can deploy it to the web.

## 1. Run it locally

You need Node.js 18.18+ installed. Then, in this folder:

```bash
npm install
npm run dev
```

Open http://localhost:3000

Out of the box, prices are **simulated** so the site looks alive immediately.

## 2. Turn on live prices

1. Get a free API key at https://finnhub.io (Dashboard → API key).
2. Copy `.env.local.example` to `.env.local` and paste your key:
   ```
   FINNHUB_KEY=your_real_key_here
   ```
3. Restart `npm run dev`. The feed status (Admin → Live price feed) flips to
   "Live · Finnhub" and quotes refresh every 15 seconds.

The key is read on the server (in `app/api/quotes/route.js`) and never reaches the
browser. The page only ever calls your own `/api/quotes` route.

## 3. Deploy it to the web (Vercel — free)

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com, "Add New → Project", and import the repo.
3. Under Settings → Environment Variables, add `FINNHUB_KEY` with your key.
4. Deploy. You get a public URL (and can attach your own domain later).

## Accounts

- Any sign-up or login is a **member** (read-only).
- The **admin** demo login is `admin@rejven.capital` / `rejven-admin`.

## Honest status / what's next

- **Accounts are demo-only right now.** Sign-up isn't stored and the admin password
  lives in the code — fine for testing, not for launch. Next step is real auth
  (Supabase has email/password + roles built in).
- **Data is in-memory** and resets on reload. Next step is a database (Supabase
  Postgres) so funds and trades persist.
- European-only tickers may need a paid Finnhub plan or a different data vendor;
  US listings (incl. ADRs like NVO, ASML) are covered on the free tier.
- Compliance: this is published as transparency/education, not advice. Confirm the
  rules with Swedish counsel before charging for access.

## Project layout

```
app/
  page.js                 home page
  layout.js               root layout
  globals.css             reset
  api/quotes/route.js     server-side Finnhub proxy (holds the key)
  components/RejvenApp.jsx the whole app UI
```
