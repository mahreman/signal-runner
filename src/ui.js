export function drawHUD(ctx, width, height, score, energy, state) {
  ctx.save();
  drawScorePanel(ctx, score);
  drawEnergyBar(ctx, width, energy);
  ctx.restore();

  drawOverlay(ctx, width, height, score, state);
}

function drawScorePanel(ctx, score) {
  const panelX = 16;
  const panelY = 16;
  const panelWidth = 190;
  const panelHeight = 60;

  ctx.save();
  ctx.fillStyle = 'rgba(5, 8, 18, 0.75)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7cc5ff';
  ctx.font = '600 12px "Segoe UI", system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE', panelX + 14, panelY + 12);

  ctx.fillStyle = '#fefefe';
  ctx.font = '700 26px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(`${Math.floor(score).toLocaleString()}`, panelX + 14, panelY + 32);
  ctx.restore();
}

function drawEnergyBar(ctx, width, energy) {
  const barWidth = Math.min(width - 32, 320);
  const barHeight = 16;
  const barX = width - barWidth - 16;
  const barY = 24;
  const pct = Math.max(0, Math.min(1, energy / 100));

  ctx.save();
  drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 999);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();
  ctx.stroke();

  const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
  gradient.addColorStop(0, '#00ff9d');
  gradient.addColorStop(0.5, '#ffd66b');
  gradient.addColorStop(1, '#ff4b81');
  ctx.fillStyle = gradient;
  if (pct > 0) {
    drawRoundedRect(ctx, barX, barY, barWidth * pct, barHeight, 999);
    ctx.fill();
  }

  ctx.lineWidth = 1.25;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.stroke();
  ctx.restore();
}

function drawOverlay(ctx, width, height, score, state) {
  let title = '';
  let subtitle = '';

  switch (state) {
    case 'LOADING':
      title = 'Loading data…';
      subtitle = 'Fetching BTCUSDT 1m klines';
      break;
    case 'READY':
      title = 'Tap to start tracking the signal';
      subtitle = 'Stay aligned with the glowing price';
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
  ctx.fillStyle = '#f5f5f5';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
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
