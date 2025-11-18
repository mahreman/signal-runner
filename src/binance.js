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
  }
}
