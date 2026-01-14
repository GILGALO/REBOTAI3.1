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

  const response = await fetch(
    `https://finnhub.io/api/v1/forex/candle?symbol=OANDA:${symbol.replace("/", "_")}&resolution=5&from=${from}&to=${to}&token=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.statusText}`);
  }

  return await response.json();
}
