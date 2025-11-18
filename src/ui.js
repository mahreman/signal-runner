import { HUD_TEXT_COLOR, ENERGY_BAR_BG, ENERGY_BAR_FILL, OVERLAY_BG } from './config.js';

export function drawHUD(ctx, width, height, score, energy, state) {
  ctx.save();
  ctx.fillStyle = HUD_TEXT_COLOR;
  ctx.font = '600 20px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${Math.floor(score)}`, 16, 16);

  const barWidth = width - 32;
  const barHeight = 12;
  const barX = 16;
  const barY = 44;
  ctx.fillStyle = ENERGY_BAR_BG;
  ctx.fillRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = ENERGY_BAR_FILL;
  ctx.fillRect(barX, barY, (barWidth * Math.max(0, Math.min(100, energy))) / 100, barHeight);
  ctx.strokeStyle = HUD_TEXT_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  ctx.restore();

  drawOverlay(ctx, width, height, state, score);
}

function drawOverlay(ctx, width, height, state, score) {
  let lines = [];
  if (state === 'LOADING') {
    lines = ['Loading data…'];
  } else if (state === 'READY') {
    lines = ['Tap to start'];
  } else if (state === 'GAME_OVER') {
    lines = ['Game Over', `Score: ${Math.floor(score)}`, 'Tap to restart'];
  } else if (state === 'ERROR') {
    lines = ['Data error', 'Retry later'];
  }

  if (!lines.length) return;

  ctx.save();
  ctx.fillStyle = OVERLAY_BG;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = HUD_TEXT_COLOR;
  ctx.font = '700 26px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((line, index) => {
    const offset = (index - (lines.length - 1) / 2) * 34;
    ctx.fillText(line, width / 2, height / 2 + offset);
  });
  ctx.restore();
}
