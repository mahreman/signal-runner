import {
  ENERGY_MAX,
  ENERGY_REGEN_PER_SECOND,
  DAMAGE_PER_SECOND,
  DISTANCE_THRESHOLD,
  PLAYER_LERP_SPEED,
  PLAYER_RADIUS_MIN,
  PLAYER_COLOR,
} from './config.js';

const playerState = {
  x: 0,
  y: 0,
  radius: PLAYER_RADIUS_MIN,
  energy: ENERGY_MAX,
  targetX: 0,
  boundsWidth: 0,
};

export function initPlayer(startX, yPos, canvasWidth) {
  playerState.boundsWidth = canvasWidth;
  playerState.radius = Math.max(PLAYER_RADIUS_MIN, canvasWidth * 0.02);
  playerState.x = startX;
  playerState.y = yPos;
  playerState.targetX = startX;
  playerState.energy = ENERGY_MAX;
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
  ctx.save();
  ctx.fillStyle = PLAYER_COLOR;
  ctx.beginPath();
  ctx.arc(playerState.x, playerState.y, playerState.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
