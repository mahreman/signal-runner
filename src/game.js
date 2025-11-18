import {
  BACKGROUND_COLOR,
  BASE_SCORE_GAIN,
  MAX_DISTANCE_RATIO,
  ACCURACY_THRESHOLD,
  DAMAGE_PER_SECOND,
  ENERGY_REGEN_PER_SECOND,
  PLAYER_VERTICAL_RATIO,
} from './config.js';
import { fetchKlines } from './binance.js';
import { klinesToTrackPoints } from './dataTransform.js';
import { initTrack, updateTrack, drawTrack, getXAtY, resetTrackOffset } from './track.js';
import {
  initPlayer,
  getPlayerState,
  setPlayerTargetX,
  updatePlayer,
  drawPlayer,
} from './player.js';
import { setupInput } from './input.js';
import { drawHUD } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let state = 'LOADING';
let lastTimestamp = 0;
let score = 0;
let viewportWidth = window.innerWidth || 360;
let viewportHeight = window.innerHeight || 640;
let klinesCache = [];

resizeCanvas();
setupInputHandlers();
loadData();
requestAnimationFrame(gameLoop);
window.addEventListener('resize', () => {
  resizeCanvas();
  rebuildTrack();
});

function setupInputHandlers() {
  setupInput(
    canvas,
    (x) => {
      setPlayerTargetX(x, viewportWidth);
    },
    () => {
      if (state === 'READY' || state === 'GAME_OVER') {
        startRun();
      }
    },
  );
}

async function loadData() {
  try {
    const klines = await fetchKlines('BTCUSDT', '1m', 1000);
    klinesCache = klines;
  } catch (error) {
    console.warn('Binance verisi alınamadı, fallback kullanılacak.', error);
    klinesCache = generateFallbackKlines(600);
  }
  rebuildTrack();
  state = 'READY';
}

function rebuildTrack() {
  if (!klinesCache.length || !viewportWidth || !viewportHeight) {
    return;
  }
  const prevPlayer = { ...getPlayerState() };
  const points = klinesToTrackPoints(klinesCache, viewportWidth, viewportHeight);
  initTrack(points, viewportWidth, viewportHeight);
  initPlayer(viewportWidth, viewportHeight);
  const player = getPlayerState();
  if (prevPlayer.x && prevPlayer.canvasWidth) {
    const ratio = prevPlayer.x / prevPlayer.canvasWidth;
    player.x = ratio * viewportWidth;
    player.targetX = player.x;
  }
  player.energy = prevPlayer.energy ?? 100;
  player.y = viewportHeight * PLAYER_VERTICAL_RATIO;
}

function startRun() {
  resetTrackOffset();
  initPlayer(viewportWidth, viewportHeight);
  const player = getPlayerState();
  player.energy = 100;
  score = 0;
  state = 'RUNNING';
}

function update(dt) {
  if (state !== 'RUNNING') {
    return;
  }
  updateTrack(dt);
  updatePlayer(dt);
  const player = getPlayerState();
  const idealX = getXAtY(player.y);
  const maxDistance = Math.max(1, viewportWidth * MAX_DISTANCE_RATIO);
  const distance = Math.abs(player.x - idealX);
  const distanceRatio = Math.min(distance / maxDistance, 1);
  const accuracy = 1 - distanceRatio;
  score += BASE_SCORE_GAIN * dt * accuracy;

  if (distanceRatio > ACCURACY_THRESHOLD) {
    const over = distanceRatio - ACCURACY_THRESHOLD;
    const normalizedOver = over / (1 - ACCURACY_THRESHOLD);
    player.energy -= DAMAGE_PER_SECOND * dt * normalizedOver;
  } else {
    player.energy = Math.min(100, player.energy + ENERGY_REGEN_PER_SECOND * dt);
  }

  if (player.energy <= 0) {
    player.energy = 0;
    state = 'GAME_OVER';
  }
}

function draw() {
  ctx.save();
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  drawTrack(ctx, viewportWidth, viewportHeight);
  drawPlayer(ctx);
  const player = getPlayerState();
  drawHUD(ctx, viewportWidth, viewportHeight, { score, energy: player.energy, state });
  ctx.restore();
}

function gameLoop(timestamp) {
  const dt = Math.min(0.033, (timestamp - lastTimestamp) / 1000 || 0);
  lastTimestamp = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  const width = window.innerWidth || document.documentElement.clientWidth || 360;
  const height = window.innerHeight || document.documentElement.clientHeight || 640;
  viewportWidth = width;
  viewportHeight = height;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

function generateFallbackKlines(count) {
  const now = Date.now();
  const result = [];
  let value = 25000;
  for (let i = 0; i < count; i += 1) {
    const wave = Math.sin(i * 0.05) * 200 + Math.cos(i * 0.013) * 120;
    value += wave * 0.02;
    const close = value;
    result.push({
      openTime: now - (count - i) * 60000,
      open: close,
      high: close + 50,
      low: close - 50,
      close,
      volume: 1,
      closeTime: now - (count - i - 1) * 60000,
    });
  }
  return result;
}
