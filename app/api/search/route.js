// Server-side proxy for Finnhub symbol search.
// The browser calls /api/search?q=volvo and gets back matching symbols
// across exchanges. The API key stays on the server.

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  const key = process.env.FINNHUB_KEY;
  if (!key) {
    return Response.json({ error: "FINNHUB_KEY is not set on the server." }, { status: 500 });
  }
  if (!q) {
    return Response.json({ result: [] });
  }

  try {
    const r = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${key}`,
      { cache: "no-store" }
    );
    const data = await r.json();
    const result = Array.isArray(data.result) ? data.result.slice(0, 12) : [];
    return Response.json({ result });
  } catch {
    return Response.json({ error: "Could not reach the data provider." }, { status: 502 });
  }
}
