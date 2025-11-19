function mapPriceToY(price, minLow, maxHigh, canvasHeight) {
  const range = maxHigh - minLow + 1e-9;
  const normalized = (price - minLow) / range;
  return canvasHeight - normalized * canvasHeight;
}

export function klinesToTrackPoints(klines, canvasWidth, canvasHeight) {
  if (!Array.isArray(klines) || klines.length === 0) {
    return [];
  }

  const minLow = Math.min(...klines.map((k) => k.low));
  const maxHigh = Math.max(...klines.map((k) => k.high));
  const visibleCandles = Math.max(1, Math.min(klines.length, 60));
  const candleSpacing = canvasWidth / visibleCandles;

  return klines.map((kline, index) => {
    const x = index * candleSpacing + candleSpacing / 2;
    const yHigh = mapPriceToY(kline.high, minLow, maxHigh, canvasHeight);
    const yLow = mapPriceToY(kline.low, minLow, maxHigh, canvasHeight);
    const yOpen = mapPriceToY(kline.open, minLow, maxHigh, canvasHeight);
    const yClose = mapPriceToY(kline.close, minLow, maxHigh, canvasHeight);

    return {
      x,
      yHigh,
      yLow,
      yOpen,
      yClose,
      isBull: kline.close >= kline.open,
    };
  });
}
