const SCROLL_SPEED = 60; // px per second
const GRID_SPACING = 80;

const trackState = {
  candles: [],
  scrollOffset: 0,
  width: 0,
  height: 0,
  candleSpacing: 8,
};

export function initTrack(points, canvasWidth = trackState.width, canvasHeight = trackState.height) {
  trackState.candles = Array.isArray(points) ? points.slice() : [];
  trackState.scrollOffset = 0;
  trackState.width = canvasWidth || trackState.width || 0;
  trackState.height = canvasHeight || trackState.height || 0;
  if (trackState.candles.length > 1) {
    trackState.candleSpacing = Math.abs(trackState.candles[1].x - trackState.candles[0].x);
  } else if (trackState.width) {
    const count = Math.max(1, Math.min(trackState.candles.length || 1, 80));
    trackState.candleSpacing = trackState.width / count;
  }
}

export function resetTrackOffset() {
  trackState.scrollOffset = 0;
}

export function updateTrack(dt) {
  if (!trackState.candles.length) return;
  trackState.scrollOffset += SCROLL_SPEED * dt;
  const height = trackState.height || 1;
  if (trackState.scrollOffset > height) {
    trackState.scrollOffset -= height;
  }
}

export function drawTrack(ctx, width, height) {
  if (!trackState.candles.length) return;
  trackState.width = width;
  trackState.height = height;

  drawGrid(ctx, width, height);
  drawCandles(ctx, width, height);
  drawPriceLine(ctx, width, height);
}

export function getXAtY(targetY) {
  if (!trackState.candles.length) {
    return null;
  }

  const height = trackState.height || 1;
  const normalizedTarget = ((targetY - trackState.scrollOffset) % height + height) % height;
  let fallbackX = trackState.candles[0].x;
  let closestDistance = Math.abs(trackState.candles[0].yClose - normalizedTarget);

  for (let i = 0; i < trackState.candles.length - 1; i += 1) {
    const current = trackState.candles[i];
    const next = trackState.candles[i + 1];
    const y1 = current.yClose;
    const y2 = next.yClose;
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    if (normalizedTarget >= minY && normalizedTarget <= maxY && Math.abs(y2 - y1) > 0.5) {
      const t = (normalizedTarget - y1) / (y2 - y1);
      return current.x + (next.x - current.x) * t;
    }

    const distance = Math.abs(y1 - normalizedTarget);
    if (distance < closestDistance) {
      closestDistance = distance;
      fallbackX = current.x;
    }
  }

  const last = trackState.candles[trackState.candles.length - 1];
  if (Math.abs(last.yClose - normalizedTarget) < closestDistance) {
    fallbackX = last.x;
  }
  return fallbackX;
}

function drawGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += GRID_SPACING) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const offsetY = trackState.scrollOffset % GRID_SPACING;
  for (let y = -GRID_SPACING; y <= height + GRID_SPACING; y += GRID_SPACING) {
    ctx.beginPath();
    ctx.moveTo(0, y + offsetY);
    ctx.lineTo(width, y + offsetY);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCandles(ctx, width, height) {
  const bodyWidth = Math.max(2, trackState.candleSpacing * 0.6);
  const baseOffset = trackState.scrollOffset % height;
  const offsets = [baseOffset, baseOffset - height];
  const buffer = 120;

  offsets.forEach((offsetValue) => {
    trackState.candles.forEach((candle) => {
      const yHigh = candle.yHigh + offsetValue;
      const yLow = candle.yLow + offsetValue;
      const yOpen = candle.yOpen + offsetValue;
      const yClose = candle.yClose + offsetValue;
      const top = Math.min(yHigh, yLow, yOpen, yClose);
      const bottom = Math.max(yHigh, yLow, yOpen, yClose);
      if (bottom < -buffer || top > height + buffer) {
        return;
      }

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(candle.x, yHigh);
      ctx.lineTo(candle.x, yLow);
      ctx.stroke();
      ctx.restore();

      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
      const bodyX = candle.x - bodyWidth / 2;
      const bodyY = Math.min(yOpen, yClose);
      const mainColor = candle.isBull ? '#00ff9d' : '#ff4b81';
      const shadowColor = candle.isBull ? '#00d680' : '#d43a6a';
      const highlightColor = 'rgba(255, 255, 255, 0.22)';

      ctx.save();
      ctx.fillStyle = mainColor;
      ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);

      ctx.fillStyle = shadowColor;
      ctx.fillRect(bodyX + bodyWidth * 0.65, bodyY, bodyWidth * 0.35, bodyHeight);

      ctx.fillStyle = highlightColor;
      ctx.fillRect(bodyX, bodyY, bodyWidth * 0.18, bodyHeight);
      ctx.restore();
    });
  });
}

function drawPriceLine(ctx, width, height) {
  const glowColor = 'rgba(0, 247, 255, 0.35)';
  const lineColor = '#35f0ff';
  const baseOffset = trackState.scrollOffset % height;
  const offsets = [baseOffset, baseOffset - height];

  offsets.forEach((offsetValue) => {
    const points = trackState.candles
      .map((candle) => ({ x: candle.x, y: candle.yClose + offsetValue }))
      .filter((point) => point.y >= -80 && point.y <= height + 80);

    if (points.length < 2) return;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.restore();
  });
}
