import { TRACK_SCROLL_SPEED, TRACK_LINE_COLOR, TRACK_LINE_WIDTH } from './config.js';

const trackState = {
  points: [],
  scrollOffset: 0,
  canvasHeight: 1,
};

// Track verisini hazırlar ve başlangıç offset'ini sıfırlar.
export function initTrack(points, canvasWidth, canvasHeight) {
  trackState.points = points;
  trackState.scrollOffset = 0;
  trackState.canvasHeight = canvasHeight || 1;
}

export function resetTrackOffset() {
  trackState.scrollOffset = 0;
}

export function updateTrack(dt) {
  if (!trackState.points.length) {
    return;
  }
  trackState.scrollOffset += TRACK_SCROLL_SPEED * dt;
  if (trackState.scrollOffset > trackState.canvasHeight) {
    trackState.scrollOffset -= trackState.canvasHeight;
  }
}

function sampleX(normalized) {
  if (!trackState.points.length) {
    return 0;
  }
  const clamped = ((normalized % 1) + 1) % 1;
  const position = clamped * (trackState.points.length - 1);
  const index = Math.floor(position);
  const frac = position - index;
  const p1 = trackState.points[index];
  const p2 = trackState.points[Math.min(index + 1, trackState.points.length - 1)];
  return p1.x + (p2.x - p1.x) * frac;
}

export function getXAtY(y) {
  if (!trackState.points.length) {
    return 0;
  }
  const totalHeight = trackState.canvasHeight;
  const worldY = y + trackState.scrollOffset;
  const normalized = (worldY / totalHeight) % 1;
  return sampleX(normalized);
}

export function drawTrack(ctx, canvasWidth, canvasHeight) {
  if (!trackState.points.length) {
    return;
  }
  ctx.save();
  ctx.lineWidth = TRACK_LINE_WIDTH;
  ctx.strokeStyle = TRACK_LINE_COLOR;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  const steps = 240;
  for (let i = 0; i <= steps; i += 1) {
    const screenY = (i / steps) * canvasHeight;
    const worldY = screenY + trackState.scrollOffset;
    const normalized = (worldY / trackState.canvasHeight) % 1;
    const x = sampleX(normalized);
    if (i === 0) {
      ctx.moveTo(x, screenY);
    } else {
      ctx.lineTo(x, screenY);
    }
  }
  ctx.stroke();
  ctx.restore();
}
