// Kline verisini ekranda kullanılacak polylinelara dönüştürür.
export function klinesToTrackPoints(klines, canvasWidth, canvasHeight) {
  if (!klines.length) {
    return [];
  }

  const closes = klines.map((k) => k.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const count = closes.length;

  return closes.map((close, index) => {
    const priceNorm = (close - min) / range;
    const t = count > 1 ? index / (count - 1) : 0;
    return {
      x: priceNorm * canvasWidth,
      y: t * canvasHeight,
      t,
      close,
    };
  });
}
