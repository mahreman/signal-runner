export async function fetchKlines(symbol, interval, limit) {
  const url = new URL('https://api.binance.com/api/v3/klines');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('limit', limit);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    const raw = await response.json();
    return raw.map((entry) => ({
      openTime: entry[0],
      open: Number(entry[1]),
      high: Number(entry[2]),
      low: Number(entry[3]),
      close: Number(entry[4]),
      volume: Number(entry[5]),
      closeTime: entry[6],
    }));
  } catch (error) {
    console.error('Failed to fetch Binance klines', error);
    throw error;
// src/binance.js

// Frontend tarafında artık direkt Binance'e gitmiyoruz.
// Aynı origin'deki Node proxy'mize istek atıyoruz:
//   /api/klines?symbol=BTCUSDT&interval=1m&limit=1000

export async function fetchKlines(symbol, interval, limit) {
  const params = new URLSearchParams({
    symbol: symbol || "BTCUSDT",
    interval: interval || "1m",
    limit: String(limit || 1000),
  });

  const url = `/api/klines?${params.toString()}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error("fetchKlines resp not ok:", resp.status, resp.statusText);
      throw new Error("Failed to fetch klines from proxy");
    }

    const raw = await resp.json();

    // Binance klines formatı:
    // [ openTime, open, high, low, close, volume, closeTime, ... ]
    return raw.map((k) => {
      return {
        openTime: k[0],
        open: Number(k[1]),
        high: Number(k[2]),
        low: Number(k[3]),
        close: Number(k[4]),
        volume: Number(k[5]),
        closeTime: k[6],
      };
    });
  } catch (err) {
    console.error("fetchKlines error:", err);
    throw err;
  }
}
