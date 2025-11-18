import {
  PLAYER_VERTICAL_RATIO,
  PLAYER_RADIUS_RATIO,
  PLAYER_LERP_SPEED,
  PLAYER_COLOR,
} from './config.js';

const playerState = {
  x: 0,
  y: 0,
  radius: 10,
  targetX: 0,
  energy: 100,
  canvasWidth: 0,
};

export function initPlayer(canvasWidth, canvasHeight) {
  const radius = Math.max(10, canvasWidth * PLAYER_RADIUS_RATIO);
  playerState.radius = radius;
  playerState.x = canvasWidth / 2;
  playerState.y = canvasHeight * PLAYER_VERTICAL_RATIO;
  playerState.targetX = playerState.x;
  playerState.energy = 100;
  playerState.canvasWidth = canvasWidth;
}

export function resetPlayer(canvasWidth, canvasHeight) {
  initPlayer(canvasWidth, canvasHeight);
}

export function getPlayerState() {
  return playerState;
}

export function setPlayerTargetX(x, canvasWidth) {
  if (canvasWidth) {
    playerState.canvasWidth = canvasWidth;
  }
  const width = playerState.canvasWidth || canvasWidth || 1;
  const clamped = Math.min(Math.max(x, playerState.radius), width - playerState.radius);
  playerState.targetX = clamped;
}

export function updatePlayer(dt) {
  const dx = playerState.targetX - playerState.x;
  const lerp = Math.min(1, PLAYER_LERP_SPEED * dt);
  playerState.x += dx * lerp;
}

export function drawPlayer(ctx) {
  ctx.save();
  ctx.fillStyle = PLAYER_COLOR;
  ctx.beginPath();
  ctx.arc(playerState.x, playerState.y, playerState.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
