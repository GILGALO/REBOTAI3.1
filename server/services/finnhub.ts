export async function getForexRate(symbol: string) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error("FINNHUB_API_KEY not set");

  const response = await fetch(
    `https://finnhub.io/api/v1/forex/rates?base=${symbol}&token=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.statusText}`);
  }

  const data = await response.json();
  // Finnhub forex rates returns an object with quote rates
  // For simplicity in this signals bot, we'll use the USD cross or similar
  return data.quote || {};
}

export async function getForexCandles(symbol: string) {
  const apiKey = process.env.FINNHUB_API_KEY;
  const to = Math.floor(Date.now() / 1000);
  const from = to - (60 * 60); // Last hour

  const symbols = [
    `FX_IDC:${symbol.replace("/", "")}`,
    `OANDA:${symbol.replace("/", "_")}`,
    `FOREXCOM:${symbol.replace("/", "_")}`,
    `SAXO:${symbol.replace("/", "_")}`,
    `ICM:${symbol.replace("/", "")}`
  ];

  for (const s of symbols) {
    try {
      console.log(`[Finnhub] Attempting fetch from source: ${s}`);
      const url = `https://finnhub.io/api/v1/forex/candle?symbol=${s}&resolution=5&from=${from}&to=${to}&token=${apiKey}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data.s === "ok" && data.c && data.c.length > 5) {
          console.log(`[Finnhub] Successfully fetched data for ${s}`);
          return data;
        } else {
          console.warn(`[Finnhub] Source ${s} returned status: ${data.s}. URL: ${url}`);
        }
      } else {
        console.warn(`[Finnhub] Source ${s} failed with status: ${response.status}. URL: ${url}`);
      }
    } catch (err) {
      console.warn(`[Finnhub] Exception during fetch from ${s}:`, err);
    }
  }

  throw new Error(`Failed to fetch forex candles for ${symbol} from all sources`);
}
