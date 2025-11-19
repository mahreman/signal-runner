import {
  BASE_SCORE_GAIN,
  MAX_DISTANCE_RATIO,
  BACKGROUND_COLOR,
  PLAYER_Y_RATIO,
} from './config.js';
import { fetchKlines } from './binance.js';
import { klinesToTrackPoints } from './dataTransform.js';
import { initTrack, updateTrack, drawTrack, getXAtY, resetTrackOffset } from './track.js';
import {
  initPlayer,
  setTargetX,
  updatePlayer,
  applyDistanceAndUpdateEnergy,
  getEnergy,
  getPlayer,
  drawPlayer,
} from './player.js';
import { setupInput } from './input.js';
import { drawHUD } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let logicalWidth = window.innerWidth;
let logicalHeight = window.innerHeight;
let lastTime = 0;
let state = 'LOADING';
let score = 0;
let errorMessage = '';
let cachedKlines = [];
let cachedPoints = [];

resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  rebuildFromCache();
});

setupInput(canvas, (x) => {
  setTargetX(x);
});
canvas.addEventListener('pointerdown', handleTap, { passive: false });

init();
requestAnimationFrame(loop);

async function init() {
  state = 'LOADING';
  try {
    const klines = await fetchKlines('BTCUSDT', '1m', 1000);
    cachedKlines = klines;
    cachedPoints = klinesToTrackPoints(klines, logicalWidth, logicalHeight);
    initTrack(cachedPoints, logicalWidth, logicalHeight);
    const startX = cachedPoints.length ? cachedPoints[cachedPoints.length - 1].x : logicalWidth / 2;
    const playerY = logicalHeight * PLAYER_Y_RATIO;
    initPlayer(startX, playerY, logicalWidth);
    state = 'READY';
  } catch (error) {
    console.error(error);
    errorMessage = 'Binance verisi alınamadı.';
    state = 'ERROR';
  }
}

function rebuildFromCache() {
  if (!cachedKlines.length) return;
  cachedPoints = klinesToTrackPoints(cachedKlines, logicalWidth, logicalHeight);
  initTrack(cachedPoints, logicalWidth, logicalHeight);
  const playerY = logicalHeight * PLAYER_Y_RATIO;
  initPlayer(logicalWidth / 2, playerY, logicalWidth);
  if (state === 'RUNNING') {
    state = 'READY';
  }
}

function handleTap(event) {
  if (state === 'READY' || state === 'GAME_OVER') {
    event.preventDefault();
    startRun();
  }
}

function startRun() {
  score = 0;
  resetTrackOffset();
  const playerY = logicalHeight * PLAYER_Y_RATIO;
  initPlayer(logicalWidth / 2, playerY, logicalWidth);
  state = 'RUNNING';
}

function update(dt) {
  if (state !== 'RUNNING') return;

  updateTrack(dt);
  updatePlayer(dt, logicalWidth);
  const player = getPlayer();
  const idealX = getXAtY(player.y);
  if (idealX == null) {
    state = 'GAME_OVER';
    return;
  }

  const maxDistance = Math.max(1, logicalWidth * MAX_DISTANCE_RATIO);
  const distance = Math.abs(player.x - idealX);
  const distanceRatio = Math.max(0, Math.min(1, distance / maxDistance));

  score += BASE_SCORE_GAIN * dt * (1 - distanceRatio);
  applyDistanceAndUpdateEnergy(distanceRatio, dt);

  if (getEnergy() <= 0) {
    state = 'GAME_OVER';
  }
}

function draw() {
  ctx.save();
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  drawTrack(ctx, logicalWidth, logicalHeight);
  drawPlayer(ctx);
  drawHUD(ctx, logicalWidth, logicalHeight, score, getEnergy(), state);
  if (state === 'ERROR') {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(errorMessage, logicalWidth / 2, logicalHeight * 0.7);
  }
  ctx.restore();
}

function loop(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastTime) / 1000 || 0);
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function resizeCanvas() {
  logicalWidth = window.innerWidth || document.documentElement.clientWidth || 360;
  logicalHeight = window.innerHeight || document.documentElement.clientHeight || 640;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
