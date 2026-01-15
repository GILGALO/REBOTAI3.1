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

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/forex/candle?symbol=OANDA:${symbol.replace("/", "_")}&resolution=5&from=${from}&to=${to}&token=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(`[Finnhub] API Key Forbidden for OANDA:${symbol}. Falling back to FX_IDC.`);
        const fallbackResponse = await fetch(
          `https://finnhub.io/api/v1/forex/candle?symbol=FX_IDC:${symbol.replace("/", "")}&resolution=5&from=${from}&to=${to}&token=${apiKey}`
        );
        if (fallbackResponse.ok) return await fallbackResponse.json();
      }
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.s !== "ok") {
      throw new Error(`Finnhub returned status: ${data.s}`);
    }
    return data;
  } catch (err) {
    console.error(`[Finnhub] Candle fetch failed:`, err);
    throw err;
  }
}
