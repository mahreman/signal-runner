function mapPriceToY(price, minLow, maxHigh, canvasHeight) {
  const range = maxHigh - minLow + 1e-9;
  const normalized = (price - minLow) / range;
  return canvasHeight - normalized * canvasHeight;
}

export function klinesToTrackPoints(klines, canvasWidth, canvasHeight) {
  if (!Array.isArray(klines) || klines.length === 0) {
    return [];
  }

  const minLow = Math.min(...klines.map((k) => Number(k.low)));
  const maxHigh = Math.max(...klines.map((k) => Number(k.high)));
  const visibleCount = Math.max(1, Math.min(klines.length, 80));
  const candleSpacing = canvasWidth / visibleCount;

  return klines.map((kline, index) => {
    const open = Number(kline.open);
    const high = Number(kline.high);
    const low = Number(kline.low);
    const close = Number(kline.close);
    const x = index * candleSpacing + candleSpacing * 0.5;

    return {
      x,
      yHigh: mapPriceToY(high, minLow, maxHigh, canvasHeight),
      yLow: mapPriceToY(low, minLow, maxHigh, canvasHeight),
      yOpen: mapPriceToY(open, minLow, maxHigh, canvasHeight),
      yClose: mapPriceToY(close, minLow, maxHigh, canvasHeight),
      close,
      isBull: close >= open,
    };
export function klinesToTrackPoints(klines, canvasWidth, canvasHeight) {
  if (!Array.isArray(klines) || !klines.length) {
    return [];
  }

  const closes = klines.map((k) => k.close);
  const minClose = Math.min(...closes);
  const maxClose = Math.max(...closes);
  const range = maxClose - minClose + 1e-9;
  const lastIndex = klines.length - 1;

  return klines.map((kline, index) => {
    const normalizedX = (kline.close - minClose) / range;
    const x = normalizedX * canvasWidth;
    const y = canvasHeight - (index / (lastIndex || 1)) * canvasHeight;
    return { x, y, close: kline.close };
  });
}
