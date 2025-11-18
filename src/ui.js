import { HUD_TEXT_COLOR, ENERGY_BAR_BG, ENERGY_BAR_FILL, OVERLAY_BG } from './config.js';

export function drawHUD(ctx, width, height, { score, energy, state }) {
  ctx.save();
  ctx.fillStyle = HUD_TEXT_COLOR;
  ctx.font = '600 20px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score.toFixed(0)}`, 16, 32);

  // Enerji barı
  const barWidth = width - 32;
  const barHeight = 14;
  const barX = 16;
  const barY = 46;
  ctx.fillStyle = ENERGY_BAR_BG;
  ctx.fillRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = ENERGY_BAR_FILL;
  ctx.fillRect(barX, barY, (barWidth * Math.max(energy, 0)) / 100, barHeight);
  ctx.strokeStyle = HUD_TEXT_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  ctx.restore();

  drawOverlay(ctx, width, height, state, score);
}

function drawOverlay(ctx, width, height, state, score) {
  let message = '';
  if (state === 'LOADING') {
    message = 'Loading data…';
  } else if (state === 'READY') {
    message = 'Tap to start';
  } else if (state === 'GAME_OVER') {
    message = `Game Over\nScore: ${score.toFixed(0)}\nTap to restart`;
  }

  if (!message) {
    return;
  }

  ctx.save();
  ctx.fillStyle = OVERLAY_BG;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = HUD_TEXT_COLOR;
  ctx.font = '700 28px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  message.split('\n').forEach((line, index, arr) => {
    const y = height / 2 + (index - (arr.length - 1) / 2) * 34;
    ctx.fillText(line, width / 2, y);
  });
  ctx.restore();
}
