const SCROLL_SPEED = 40; // pixels per second

const trackState = {
  candles: [],
  scrollOffset: 0,
  width: 0,
  height: 0,
  candleSpacing: 8,
};

export function initTrack(candleData, canvasWidth, canvasHeight) {
  trackState.candles = Array.isArray(candleData) ? candleData.slice() : [];
  trackState.scrollOffset = 0;
  trackState.width = canvasWidth;
  trackState.height = canvasHeight;
  if (trackState.candles.length > 1) {
    trackState.candleSpacing = Math.abs(trackState.candles[1].x - trackState.candles[0].x);
  } else {
    trackState.candleSpacing = canvasWidth / Math.max(1, Math.min(trackState.candles.length || 1, 60));
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

  drawBackgroundGradient(ctx, width, height);
  drawGrid(ctx, width, height);
  drawCandlesAndLine(ctx, width, height);
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

    if (normalizedTarget >= minY && normalizedTarget <= maxY) {
      const t = (normalizedTarget - y1) / (y2 - y1 || 1);
      return current.x + (next.x - current.x) * t;
    }

    const distance = Math.abs(y1 - normalizedTarget);
    if (distance < closestDistance) {
      closestDistance = distance;
      fallbackX = current.x;
    }
  }

  const lastCandle = trackState.candles[trackState.candles.length - 1];
  if (Math.abs(lastCandle.yClose - normalizedTarget) < closestDistance) {
    fallbackX = lastCandle.x;
  }
  return fallbackX;
}

function drawBackgroundGradient(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#060a13');
  gradient.addColorStop(0.5, '#050609');
  gradient.addColorStop(1, '#02030a');
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawGrid(ctx, width, height) {
  const spacing = 80;
  const verticalColor = 'rgba(255, 255, 255, 0.06)';
  const horizontalColor = 'rgba(0, 255, 157, 0.05)';
  ctx.save();
  ctx.lineWidth = 1;

  // vertical lines
  ctx.strokeStyle = verticalColor;
  for (let x = 0; x <= width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // horizontal lines (scroll with track)
  const offset = trackState.scrollOffset % spacing;
  ctx.strokeStyle = horizontalColor;
  for (let y = -spacing; y <= height + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(width, y + offset);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCandlesAndLine(ctx, width, height) {
  const bodyWidth = Math.max(2, trackState.candleSpacing * 0.6);
  const offsets = [trackState.scrollOffset, trackState.scrollOffset - height];
  const glowColor = 'rgba(0, 247, 255, 0.4)';
  const lineColor = 'rgba(0, 247, 255, 0.95)';
  const wickColor = 'rgba(255, 255, 255, 0.35)';
  const pricePaths = offsets.map(() => []);
  const buffer = 120;

  offsets.forEach((offsetValue, offsetIndex) => {
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

      // wick
      ctx.save();
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(candle.x, yHigh);
      ctx.lineTo(candle.x, yLow);
      ctx.stroke();
      ctx.restore();

      // candle body
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
      const bodyX = candle.x - bodyWidth / 2;
      const bodyY = Math.min(yOpen, yClose);
      const fill = candle.isBull ? 'rgba(0, 255, 157, 0.8)' : 'rgba(255, 75, 129, 0.85)';
      ctx.save();
      ctx.fillStyle = fill;
      ctx.shadowColor = candle.isBull ? 'rgba(0, 255, 157, 0.35)' : 'rgba(255, 75, 129, 0.35)';
      ctx.shadowBlur = 12;
      ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);

      // pseudo 3D edges
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(bodyX, bodyY, bodyWidth * 0.2, bodyHeight);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(bodyX + bodyWidth * 0.8, bodyY, bodyWidth * 0.2, bodyHeight);
      ctx.restore();

      pricePaths[offsetIndex].push({ x: candle.x, y: yClose });
    });
  });

  // draw glowing price line for each wrapped path
  pricePaths.forEach((points) => {
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
