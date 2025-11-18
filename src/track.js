import { TRACK_SCROLL_SPEED, TRACK_LINE_COLOR, TRACK_LINE_WIDTH } from './config.js';

const trackState = {
  points: [],
  scrollOffset: 0,
  width: 0,
  height: 0,
};

export function initTrack(trackPoints, canvasWidth, canvasHeight) {
  trackState.points = trackPoints.slice();
  trackState.scrollOffset = 0;
  trackState.width = canvasWidth;
  trackState.height = canvasHeight;
}

export function resetTrackOffset() {
  trackState.scrollOffset = 0;
}

export function updateTrack(dt) {
  if (!trackState.points.length) return;
  trackState.scrollOffset += TRACK_SCROLL_SPEED * dt;
  if (trackState.scrollOffset > trackState.height) {
    trackState.scrollOffset -= trackState.height;
  }
}

export function drawTrack(ctx, canvasWidth, canvasHeight) {
  if (!trackState.points.length) return;

  ctx.save();
  ctx.strokeStyle = TRACK_LINE_COLOR;
  ctx.lineWidth = TRACK_LINE_WIDTH;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();

  let started = false;
  let previousY = 0;
  for (let i = 0; i < trackState.points.length; i += 1) {
    const basePoint = trackState.points[i];
    let wrappedY = basePoint.y + trackState.scrollOffset;
    wrappedY %= canvasHeight;
    if (wrappedY < 0) {
      wrappedY += canvasHeight;
    }

    if (!started) {
      ctx.moveTo(basePoint.x, wrappedY);
      started = true;
    } else if (wrappedY < previousY) {
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(basePoint.x, wrappedY);
    } else {
      ctx.lineTo(basePoint.x, wrappedY);
    }
    previousY = wrappedY;
  }

  ctx.stroke();
  ctx.restore();
}

export function getXAtY(targetY) {
  if (!trackState.points.length) {
    return null;
  }

  const height = trackState.height || 1;
  let wrappedY = targetY + trackState.scrollOffset;
  wrappedY %= height;
  if (wrappedY < 0) {
    wrappedY += height;
  }

  for (let i = 0; i < trackState.points.length - 1; i += 1) {
    const a = trackState.points[i];
    const b = trackState.points[i + 1];

    if ((a.y >= wrappedY && b.y <= wrappedY) || (a.y <= wrappedY && b.y >= wrappedY)) {
      const range = b.y - a.y || 1;
      const t = (wrappedY - a.y) / range;
      return a.x + (b.x - a.x) * t;
    }
  }

  return trackState.points[trackState.points.length - 1].x;
}
