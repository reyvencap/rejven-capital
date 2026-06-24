// Server-side proxy for Finnhub quotes.
// The API key lives in process.env.FINNHUB_KEY and never reaches the browser.
// The browser calls /api/quotes?symbols=AAPL,NVDA and gets back a { ticker: quote } map.

export const dynamic = "force-dynamic"; // never cache; always fetch fresh quotes

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const key = process.env.FINNHUB_KEY;
  if (!key) {
    return Response.json({ error: "FINNHUB_KEY is not set on the server." }, { status: 500 });
  }
  if (symbols.length === 0) {
    return Response.json({ error: "No symbols requested." }, { status: 400 });
  }

  try {
    const entries = await Promise.all(
      symbols.map(async (s) => {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s)}&token=${key}`,
          { cache: "no-store" }
        );
        return [s, await r.json()];
      })
    );
    return Response.json(Object.fromEntries(entries));
  } catch {
    return Response.json({ error: "Could not reach the upstream data provider." }, { status: 502 });
  }
}
