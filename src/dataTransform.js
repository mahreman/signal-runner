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
