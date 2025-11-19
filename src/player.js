import {
  ENERGY_MAX,
  ENERGY_REGEN_PER_SECOND,
  DAMAGE_PER_SECOND,
  DISTANCE_THRESHOLD,
  PLAYER_LERP_SPEED,
  PLAYER_RADIUS_MIN,
} from './config.js';

const TRAIL_MAX_POINTS = 18;

const playerState = {
  x: 0,
  y: 0,
  radius: PLAYER_RADIUS_MIN,
  energy: ENERGY_MAX,
  targetX: 0,
  boundsWidth: 0,
  trail: [],
};

export function initPlayer(startX, yPos, canvasWidth) {
  playerState.boundsWidth = canvasWidth;
  playerState.radius = Math.max(PLAYER_RADIUS_MIN, canvasWidth * 0.02);
  playerState.x = startX;
  playerState.y = yPos;
  playerState.targetX = startX;
  playerState.energy = ENERGY_MAX;
  playerState.trail = [];
}

export function setTargetX(newTargetX) {
  if (!playerState.boundsWidth) return;
  const min = playerState.radius;
  const max = Math.max(min, playerState.boundsWidth - playerState.radius);
  playerState.targetX = Math.min(Math.max(newTargetX, min), max);
}

export function updatePlayer(dt, canvasWidth) {
  if (canvasWidth) {
    playerState.boundsWidth = canvasWidth;
  }
  const speed = (playerState.boundsWidth || 1) * PLAYER_LERP_SPEED * 0.1;
  const delta = playerState.targetX - playerState.x;
  const maxStep = speed * dt;
  if (Math.abs(delta) <= maxStep) {
    playerState.x = playerState.targetX;
  } else {
    playerState.x += Math.sign(delta) * maxStep;
  }

  // trail bookkeeping for glow streaks
  playerState.trail.push({ x: playerState.x, y: playerState.y });
  if (playerState.trail.length > TRAIL_MAX_POINTS) {
    playerState.trail.shift();
  }
}

export function applyDistanceAndUpdateEnergy(distanceRatio, dt) {
  if (distanceRatio > DISTANCE_THRESHOLD) {
    const penalty = distanceRatio - DISTANCE_THRESHOLD;
    playerState.energy -= DAMAGE_PER_SECOND * dt * penalty;
  } else {
    playerState.energy += ENERGY_REGEN_PER_SECOND * dt;
  }
  playerState.energy = Math.max(0, Math.min(ENERGY_MAX, playerState.energy));
}

export function getEnergy() {
  return playerState.energy;
}

export function getPlayer() {
  return { x: playerState.x, y: playerState.y, radius: playerState.radius };
}

export function drawPlayer(ctx) {
  drawTrail(ctx);
  drawShadow(ctx);
  drawOrb(ctx);
}

function drawTrail(ctx) {
  if (!playerState.trail.length) return;
  ctx.save();
  for (let i = 0; i < playerState.trail.length; i += 1) {
    const point = playerState.trail[i];
    const progress = i / playerState.trail.length;
    const alpha = progress * 0.35;
    const radius = Math.max(2, playerState.radius * progress * 0.6);
    ctx.fillStyle = `rgba(255, 214, 107, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawShadow(ctx) {
  ctx.save();
  ctx.translate(playerState.x, playerState.y + playerState.radius * 0.8);
  ctx.scale(1.8, 0.7);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(0, 0, playerState.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOrb(ctx) {
  ctx.save();
  ctx.shadowColor = 'rgba(255, 214, 107, 0.85)';
  ctx.shadowBlur = 25;
  const gradient = ctx.createRadialGradient(
    playerState.x - playerState.radius * 0.3,
    playerState.y - playerState.radius * 0.4,
    playerState.radius * 0.2,
    playerState.x,
    playerState.y,
    playerState.radius
  );
  gradient.addColorStop(0, '#fff6c7');
  gradient.addColorStop(0.4, '#ffd66b');
  gradient.addColorStop(1, '#ffb347');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(playerState.x, playerState.y, playerState.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
