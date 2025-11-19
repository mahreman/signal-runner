export function drawHUD(ctx, width, height, score, energy, state) {
  ctx.save();
  drawScore(ctx, score);
  drawEnergy(ctx, width, energy);
  ctx.restore();

  drawOverlay(ctx, width, height, score, state);
}

function drawScore(ctx, score) {
  const panelX = 14;
  const panelY = 12;
  const panelWidth = 200;
  const panelHeight = 58;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#9fd1ff';
  ctx.font = '600 12px "Segoe UI", system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE', panelX + 14, panelY + 10);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 26px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(Math.floor(score).toLocaleString(), panelX + 14, panelY + 30);
  ctx.restore();
}

function drawEnergy(ctx, width, energy) {
  const barWidth = Math.min(width - 32, 340);
  const barHeight = 16;
  const barX = width - barWidth - 16;
  const barY = 24;
  const pct = Math.max(0, Math.min(1, energy / 100));
  const fillColor = getEnergyColor(pct);

  ctx.save();
  drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 999);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();
  ctx.stroke();

  if (pct > 0) {
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    gradient.addColorStop(0, fillColor.start);
    gradient.addColorStop(1, fillColor.end);
    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, barX, barY, barWidth * pct, barHeight, 999);
    ctx.fill();
  }
  ctx.restore();
}

function drawOverlay(ctx, width, height, score, state) {
  let title = '';
  let subtitle = '';

  switch (state) {
    case 'LOADING':
      title = 'Fetching BTCUSDT 1m data…';
      subtitle = 'Preparing live candlesticks';
      break;
    case 'READY':
      title = 'Tap to start tracking the signal';
      subtitle = 'Stay aligned with the glowing price line';
      break;
    case 'GAME_OVER':
      title = 'Signal lost';
      subtitle = `Score: ${Math.floor(score).toLocaleString()}\nTap to restart`;
      break;
    case 'ERROR':
      title = 'Data error';
      subtitle = 'Unable to reach Binance';
      break;
    default:
      break;
  }

  if (!title) return;

  ctx.save();
  ctx.fillStyle = 'rgba(2, 3, 10, 0.65)';
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5f5f5';
  ctx.font = '700 30px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(title, width / 2, height / 2 - 20);

  ctx.font = '500 18px "Segoe UI", system-ui, sans-serif';
  const lines = subtitle.split('\n');
  lines.forEach((line, index) => {
    ctx.fillStyle = 'rgba(245, 245, 245, 0.85)';
    ctx.fillText(line, width / 2, height / 2 + 18 + index * 24);
  });
  ctx.restore();
}

function getEnergyColor(pct) {
  if (pct > 0.7) {
    return { start: '#00ff9d', end: '#00c7ff' };
  }
  if (pct > 0.3) {
    return { start: '#ffd66b', end: '#ff9f40' };
  }
  return { start: '#ff4b81', end: '#ff1f5a' };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
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
