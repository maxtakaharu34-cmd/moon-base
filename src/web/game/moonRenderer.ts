import { CANVAS_W, CANVAS_H, TILE, CHARACTERS, POWERUP_CONFIG } from './constants';
import type { Player, Platform, Coin, Powerup, Enemy } from './entities';
import { THEME } from './theme';

// ─── Starfield ──────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 120 }, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() * 1.5 + 0.3,
  twinkle: Math.random() * Math.PI * 2,
  speed: Math.random() * 0.02 + 0.005,
}));
let starFrame = 0;

export function drawMoonBackground(ctx: CanvasRenderingContext2D, colors: [string, string], camX: number) {
  starFrame += 0.02;
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Stars (parallax)
  STARS.forEach(s => {
    const alpha = 0.5 + 0.4 * Math.sin(s.twinkle + starFrame * s.speed * 20);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    const px = ((s.x * CANVAS_W * 3 - camX * 0.15) % CANVAS_W + CANVAS_W) % CANVAS_W;
    ctx.beginPath();
    ctx.arc(px, s.y * CANVAS_H * 0.7, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Moon
  const mx = CANVAS_W * 0.75 - camX * 0.05;
  const my = 70;
  ctx.fillStyle = '#e0e0d0';
  ctx.beginPath(); ctx.arc(mx, my, 45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c8c8b8';
  [[10, -10, 8], [-15, 5, 5], [5, 20, 4], [18, 15, 6]].forEach(([dx, dy, r]) => {
    ctx.beginPath(); ctx.arc(mx + dx, my + dy, r, 0, Math.PI * 2); ctx.fill();
  });
}

export function drawMoonPlatform(ctx: CanvasRenderingContext2D, plat: Platform) {
  const { x, y, w, h, type } = plat;
  if (type === 'cloud') {
    // Asteroid platform
    ctx.fillStyle = '#546e7a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#607d8b';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 - 2, w / 2 - 2, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (type === 'moving') {
    ctx.fillStyle = '#1a237e';
    rr(ctx, x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1.5;
    rr(ctx, x, y, w, h, 4); ctx.stroke();
    ctx.shadowColor = '#4fc3f7'; ctx.shadowBlur = 8;
    ctx.strokeStyle = '#4fc3f733';
    rr(ctx, x - 2, y - 2, w + 4, h + 4, 6); ctx.stroke();
    ctx.shadowBlur = 0;
    return;
  }
  const grd = ctx.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, '#546e7a');
  grd.addColorStop(0.3, '#455a64');
  grd.addColorStop(1, '#263238');
  ctx.fillStyle = grd;
  rr(ctx, x, y, w, h, 3); ctx.fill();
  ctx.strokeStyle = '#78909c'; ctx.lineWidth = 0.8;
  ctx.strokeRect(x, y, w, h);
  // crater details
  ctx.fillStyle = '#37474f';
  for (let i = 0; i < Math.floor(w / 30); i++) {
    ctx.beginPath();
    ctx.arc(x + 15 + i * 30, y + h / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawMoonCoin(ctx: CanvasRenderingContext2D, coin: Coin) {
  if (coin.collected) return;
  const { x, y, animFrame } = coin;
  const scaleX = Math.abs(Math.cos(animFrame * Math.PI / 3));
  ctx.save();
  ctx.translate(x + 8, y + 8);
  ctx.scale(scaleX, 1);
  const grd = ctx.createRadialGradient(-2, -2, 1, 0, 0, 9);
  grd.addColorStop(0, '#e0f7fa');
  grd.addColorStop(0.6, '#80deea');
  grd.addColorStop(1, '#0097a7');
  ctx.fillStyle = grd;
  ctx.shadowColor = '#80deea'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
  if (scaleX > 0.3) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 7px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 0);
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawMoonPowerup(ctx: CanvasRenderingContext2D, pu: Powerup) {
  if (pu.collected) return;
  const emojis: Record<string, string> = { star: '🌟', shield: '🛸', speed: '🚀', double_jump: '🌙', coin_magnet: '☄️' };
  const colors: Record<string, string> = { star: '#FFD700', shield: '#4fc3f7', speed: '#ff7043', double_jump: '#ce93d8', coin_magnet: '#80deea' };
  const col = colors[pu.type] || '#fff';
  const px = pu.x + pu.bobOffset;
  const py = pu.y + pu.bobOffset * 0.5;
  ctx.save();
  ctx.shadowColor = col; ctx.shadowBlur = 14;
  ctx.fillStyle = col + '33';
  rr(ctx, px, py, 22, 22, 6); ctx.fill();
  ctx.font = '14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emojis[pu.type] || '⭐', px + 11, py + 11);
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawMoonEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (!enemy.alive) return;
  const { x, y, w, h, type, facing, animFrame } = enemy;
  const cx = x + w / 2, cy = y + h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (facing === 1) ctx.scale(-1, 1);
  const colors = {
    walk: { body: '#4caf50', eye: '#fff', bg: '#1b5e20' },
    fly:  { body: '#9c27b0', eye: '#e1bee7', bg: '#6a1b9a' },
    jump: { body: '#ff5722', eye: '#fff', bg: '#bf360c' },
  }[type];
  // alien body
  ctx.fillStyle = colors.body;
  ctx.beginPath(); ctx.ellipse(0, 2, 12, 11, 0, 0, Math.PI * 2); ctx.fill();
  // big alien eye
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(-2, -2, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colors.eye;
  ctx.beginPath(); ctx.ellipse(-2, -2, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.ellipse(-1, -2, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-3, -4, 1, 0, Math.PI * 2); ctx.fill();
  // antennae
  ctx.strokeStyle = colors.body; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-4, -11); ctx.lineTo(-6, -17); ctx.stroke();
  ctx.beginPath(); ctx.arc(-6, -17, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  if (type === 'fly') {
    const flap = Math.sin(animFrame * Math.PI / 2) * 5;
    ctx.fillStyle = '#ce93d8aa';
    ctx.beginPath(); ctx.ellipse(-10, -3, 10, 5, -0.4 - flap * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -3, 10, 5, 0.4 + flap * 0.03, 0, Math.PI * 2); ctx.fill();
  }
  // legs
  const step = Math.sin(animFrame * Math.PI / 2) * 2;
  ctx.fillStyle = colors.body;
  ctx.beginPath(); ctx.ellipse(-4, 13 + step, 3, 4, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, 13 - step, 3, 4, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawMoonPlayer(ctx: CanvasRenderingContext2D, player: Player, moonChars: typeof THEME['characters']) {
  if (!player.alive) return;
  const char = moonChars.find(c => c.id === player.charId) || moonChars[0];
  const { x, y, w, h, facing, animFrame, onGround } = player;
  const cx = x + w / 2, cy = y + h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (facing === -1) ctx.scale(-1, 1);
  if (player.isInvincible) ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 80);
  if (player.hasPowerup('star')) { ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 18; }
  if (player.hasPowerup('shield')) {
    ctx.shadowColor = '#4fc3f7'; ctx.shadowBlur = 14;
    ctx.strokeStyle = '#4fc3f744'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
  }

  const bob = onGround && (animFrame === 1 || animFrame === 3) ? 1 : 0;
  // Spacesuit body
  ctx.fillStyle = char.color;
  ctx.beginPath(); ctx.ellipse(0, 3 + bob, 13, 14, 0, 0, Math.PI * 2); ctx.fill();
  // Helmet
  ctx.fillStyle = '#b0bec5';
  ctx.beginPath(); ctx.ellipse(0, -5 + bob, 12, 13, 0, 0, Math.PI * 2); ctx.fill();
  // Visor
  ctx.fillStyle = char.accent + 'cc';
  ctx.beginPath(); ctx.ellipse(2, -4 + bob, 8, 9, 0.1, 0, Math.PI * 2); ctx.fill();
  // reflection
  ctx.fillStyle = '#ffffff55';
  ctx.beginPath(); ctx.ellipse(-1, -7 + bob, 3, 4, -0.3, 0, Math.PI * 2); ctx.fill();
  // Suit details
  ctx.fillStyle = char.accent;
  ctx.beginPath(); ctx.ellipse(0, 7 + bob, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
  // Oxygen tank
  ctx.fillStyle = '#78909c';
  ctx.fillRect(-4, -2 + bob, 4, 8);
  // Arms
  const arm = onGround ? Math.sin(animFrame * Math.PI / 2) * 4 : 0;
  ctx.fillStyle = char.color;
  ctx.beginPath(); ctx.ellipse(-14, 3 + arm + bob, 4, 3, -0.4, 0, Math.PI * 2); ctx.fill();
  // Legs
  const step = onGround ? Math.sin(animFrame * Math.PI / 2) * 3 : 0;
  ctx.fillStyle = char.color;
  ctx.beginPath(); ctx.ellipse(-4, 16 + step + bob, 3, 5, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, 16 - step + bob, 3, 5, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  ctx.restore();
  if (player.index === 1) {
    ctx.fillStyle = '#4fc3f7'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('P2', cx, y - 6);
  }
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
