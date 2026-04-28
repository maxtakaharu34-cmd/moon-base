import { CANVAS_W, CANVAS_H, TILE, CHARACTERS, POWERUP_CONFIG } from './constants';
import type { Player, Platform, Coin, Powerup, Enemy } from './entities';
import type { LevelData } from './levels';

// ─── Star background ───────────────────────────────────────────────────────
let stars: { x: number; y: number; r: number; alpha: number }[] = [];
function ensureStars() {
  if (stars.length === 0) {
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }
  }
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  colors: [string, string],
  camX: number,
  levelWidth: number
) {
  ensureStars();
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Parallax clouds
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#fff';
  const parallax = camX * 0.3;
  for (let i = 0; i < 8; i++) {
    const cx = ((i * 350 - parallax % 350) + 350) % (CANVAS_W + 350) - 100;
    const cy = 60 + (i % 3) * 50;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 80, 30, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 50, cy - 10, 60, 25, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 100, cy, 70, 28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Platform renderer ─────────────────────────────────────────────────────
export function drawPlatform(ctx: CanvasRenderingContext2D, plat: Platform) {
  const { x, y, w, h, type } = plat;

  if (type === 'cloud') {
    ctx.fillStyle = '#ffffffcc';
    // Puffy cloud shape
    for (let i = 0; i < Math.floor(w / 24) + 1; i++) {
      ctx.beginPath();
      ctx.ellipse(x + i * 22 + 12, y + 10, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff99';
    ctx.fillRect(x, y + 10, w, h - 10);
    return;
  }

  if (type === 'spike') {
    ctx.fillStyle = '#888';
    ctx.fillRect(x, y + 10, w, h - 10);
    ctx.fillStyle = '#ccc';
    for (let i = 0; i < Math.floor(w / 12); i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 12, y + 10);
      ctx.lineTo(x + i * 12 + 6, y);
      ctx.lineTo(x + i * 12 + 12, y + 10);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  if (type === 'moving') {
    // Glowing moving platform
    const grd = ctx.createLinearGradient(x, y, x, y + h);
    grd.addColorStop(0, '#a855f7');
    grd.addColorStop(1, '#6d28d9');
    ctx.fillStyle = grd;
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 6);
    ctx.stroke();

    // Glow effect
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#d946ef44';
    ctx.lineWidth = 2;
    roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 8);
    ctx.stroke();
    ctx.shadowBlur = 0;
    return;
  }

  // Normal grass platform
  const grd = ctx.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, '#5cb85c');
  grd.addColorStop(0.3, '#4cae4c');
  grd.addColorStop(1, '#8B4513');
  ctx.fillStyle = grd;
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();

  // Grass top
  ctx.fillStyle = '#6fcf6f';
  ctx.fillRect(x + 2, y, w - 4, 8);

  // Side shading
  ctx.strokeStyle = '#388e3c';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

// ─── Coin renderer ─────────────────────────────────────────────────────────
export function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin) {
  if (coin.collected) return;
  const { x, y, animFrame } = coin;
  const scaleX = Math.abs(Math.cos(animFrame * Math.PI / 3));

  ctx.save();
  ctx.translate(x + 8, y + 8);
  ctx.scale(scaleX, 1);

  const grd = ctx.createRadialGradient(-2, -2, 1, 0, 0, 9);
  grd.addColorStop(0, '#FFF176');
  grd.addColorStop(0.6, '#FFD700');
  grd.addColorStop(1, '#FF8F00');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E65100';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (scaleX > 0.3) {
    ctx.fillStyle = '#FFF9C4';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
  }

  ctx.restore();
}

// ─── Powerup renderer ──────────────────────────────────────────────────────
export function drawPowerup(ctx: CanvasRenderingContext2D, pu: Powerup) {
  if (pu.collected) return;
  const cfg = POWERUP_CONFIG[pu.type];
  const px = pu.x + pu.bobOffset;
  const py = pu.y + pu.bobOffset * 0.5;

  ctx.save();
  ctx.shadowColor = cfg.color;
  ctx.shadowBlur = 12;

  const grd = ctx.createRadialGradient(px + 6, py + 6, 2, px + 11, py + 11, 13);
  grd.addColorStop(0, '#fff');
  grd.addColorStop(0.4, cfg.color);
  grd.addColorStop(1, cfg.color + '88');
  ctx.fillStyle = grd;
  roundRect(ctx, px, py, 22, 22, 6);
  ctx.fill();

  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cfg.label, px + 11, py + 11);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Enemy renderer ────────────────────────────────────────────────────────
export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (!enemy.alive) return;
  const { x, y, w, h, type, facing, animFrame } = enemy;
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.save();
  ctx.translate(cx, cy);
  if (facing === 1) ctx.scale(-1, 1);

  // Body colors by type
  const colors = {
    walk: { body: '#e74c3c', eye: '#fff', pupil: '#2c3e50' },
    fly:  { body: '#8e44ad', eye: '#fff', pupil: '#1abc9c' },
    jump: { body: '#e67e22', eye: '#fff', pupil: '#2c3e50' },
  }[type];

  // Body
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.ellipse(0, 2, 13, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings for fly type
  if (type === 'fly') {
    const flap = Math.sin(animFrame * Math.PI / 2) * 5;
    ctx.fillStyle = '#c39bd3';
    ctx.save();
    ctx.translate(-8, -5);
    ctx.rotate(-0.3 - flap * 0.05);
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(8, -5);
    ctx.rotate(0.3 + flap * 0.05);
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Eyes
  ctx.fillStyle = colors.eye;
  ctx.beginPath();
  ctx.ellipse(-5, -3, 5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.pupil;
  ctx.beginPath();
  ctx.ellipse(-4, -2, 2.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Angry eyebrow
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-9, -7);
  ctx.lineTo(-2, -5);
  ctx.stroke();

  // Feet (walk animation)
  if (type !== 'fly') {
    const step = Math.sin(animFrame * Math.PI / 2) * 3;
    ctx.fillStyle = colors.body;
    ctx.beginPath(); ctx.ellipse(-5, 12 + step, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, 12 - step, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

// ─── Player renderer ───────────────────────────────────────────────────────
export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  if (!player.alive) return;
  const char = CHARACTERS.find(c => c.id === player.charId) || CHARACTERS[0];
  const { x, y, w, h, facing, animFrame, onGround } = player;
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.save();
  ctx.translate(cx, cy);
  if (facing === -1) ctx.scale(-1, 1);

  // Invincibility flicker
  if (player.isInvincible) {
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 80);
  }

  // Star powerup glow
  if (player.hasPowerup('star')) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 18;
  }
  // Shield powerup glow
  if (player.hasPowerup('shield')) {
    ctx.shadowColor = '#00BFFF';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#00BFFF44';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
  }

  const bobY = onGround && (animFrame === 1 || animFrame === 3) ? 1 : 0;

  // Draw character
  drawCharacterBody(ctx, char, bobY, animFrame, onGround);

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();

  // Player label for P2
  if (player.index === 1) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('P2', cx, y - 6);
  }
}

function drawCharacterBody(
  ctx: CanvasRenderingContext2D,
  char: typeof CHARACTERS[number],
  bobY: number,
  animFrame: number,
  onGround: boolean
) {
  const { color, accent, ear } = char;

  // Ears
  ctx.fillStyle = ear;
  if (char.id === 'rabbit') {
    ctx.save();
    ctx.translate(-5, -8 + bobY);
    ctx.beginPath();
    ctx.ellipse(0, -8, 4, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(0, -8, 2, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(5, -8 + bobY);
    ctx.beginPath();
    ctx.ellipse(0, -8, 4, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(0, -8, 2, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (char.id === 'fox' || char.id === 'bear' || char.id === 'dragon') {
    ctx.save();
    ctx.translate(-6, -10 + bobY);
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(0, -10); ctx.lineTo(4, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(6, -10 + bobY);
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(0, -10); ctx.lineTo(4, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (char.id === 'penguin') {
    ctx.save();
    ctx.translate(-4, -8 + bobY);
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(4, -8 + bobY);
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 2 + bobY, 12, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly / accent
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(2, 4 + bobY, 7, 9, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(-4, -1 + bobY, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-3, -2 + bobY, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = char.id === 'penguin' ? '#ff6b35' : accent;
  ctx.beginPath();
  ctx.ellipse(6, 1 + bobY, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(7, 1 + bobY, 1, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  const step = onGround ? Math.sin(animFrame * Math.PI / 2) * 3 : 0;
  ctx.fillStyle = ear;
  ctx.beginPath(); ctx.ellipse(-4, 14 + step + bobY, 3, 4, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, 14 - step + bobY, 3, 4, 0.2, 0, Math.PI * 2); ctx.fill();

  // Arms
  ctx.fillStyle = color;
  const armSwing = onGround ? Math.sin(animFrame * Math.PI / 2) * 5 : 0;
  ctx.beginPath();
  ctx.ellipse(-12, 3 + armSwing + bobY, 4, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Goal (flag) renderer ──────────────────────────────────────────────────
export function drawGoal(ctx: CanvasRenderingContext2D, goal: { x: number; y: number }) {
  const { x, y } = goal;

  // Pole
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 60);
  ctx.lineTo(x + 12, y);
  ctx.stroke();

  // Flag
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.moveTo(x + 12, y);
  ctx.lineTo(x + 42, y + 12);
  ctx.lineTo(x + 12, y + 24);
  ctx.closePath();
  ctx.fill();

  // Star on flag
  ctx.fillStyle = '#FFD700';
  ctx.font = '12px Arial';
  ctx.fillText('★', x + 18, y + 16);

  // Base
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 62, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
export function drawHUD(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  level: number,
  totalLevels: number
) {
  const now = Date.now();
  players.forEach((p, i) => {
    const ox = i === 0 ? 10 : CANVAS_W - 180;

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(ctx, ox, 8, 165, 52, 8);
    ctx.fill();

    const char = CHARACTERS.find(c => c.id === p.charId) || CHARACTERS[0];
    ctx.fillStyle = char.color;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(i === 0 ? `P1 ${char.name}` : `P2 ${char.name}`, ox + 10, 26);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`🪙 ${p.coins}`, ox + 10, 43);
    ctx.fillStyle = '#fff';
    ctx.fillText(`${p.score}pt`, ox + 65, 43);

    // Active powerups
    p.activePowerups.forEach((ap, j) => {
      const cfg = POWERUP_CONFIG[ap.type];
      const remaining = ((ap.expiresAt - now) / 1000).toFixed(1);
      const px = ox + 105 + j * 28;
      ctx.fillStyle = cfg.color + 'aa';
      roundRect(ctx, px - 10, 28, 28, 20, 4);
      ctx.fill();
      ctx.font = '11px Arial';
      ctx.fillText(cfg.label, px - 4, 42);
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.fillText(remaining, px - 8, 50);
    });
  });

  // Level indicator
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, CANVAS_W / 2 - 60, 8, 120, 28, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${level} / ${totalLevels}`, CANVAS_W / 2, 26);
  ctx.textAlign = 'left';
}

// ─── Screen overlays ──────────────────────────────────────────────────────
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  title: string,
  lines: string[],
  btnText: string
) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 38px monospace';
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 60);

  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_W / 2, CANVAS_H / 2 - 20 + i * 26);
  });

  // Button
  const bw = 200, bh = 44;
  const bx = CANVAS_W / 2 - bw / 2;
  const by = CANVAS_H / 2 + 60;
  const grd = ctx.createLinearGradient(bx, by, bx, by + bh);
  grd.addColorStop(0, '#a855f7');
  grd.addColorStop(1, '#7c3aed');
  ctx.fillStyle = grd;
  roundRect(ctx, bx, by, bw, bh, 10);
  ctx.fill();
  ctx.strokeStyle = '#e879f9';
  ctx.lineWidth = 2;
  roundRect(ctx, bx, by, bw, bh, 10);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(btnText, CANVAS_W / 2, by + bh / 2 + 6);
  ctx.textAlign = 'left';
}

export function drawLevelComplete(ctx: CanvasRenderingContext2D, score: number, coins: number, level: number) {
  drawOverlay(ctx, '🎉 CLEAR!', [
    `Score: ${score}`,
    `Coins: 🪙 ${coins}`,
    level < 3 ? `Next: Level ${level + 1}` : 'All levels done!',
  ], level < 3 ? 'Next Level →' : 'Play Again');
}

export function drawGameOver(ctx: CanvasRenderingContext2D, score: number) {
  drawOverlay(ctx, 'GAME OVER', [`Score: ${score}`, 'Better luck next time!'], 'Try Again');
}

// ─── util ────────────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
