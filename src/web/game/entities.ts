import { GRAVITY, JUMP_FORCE, PLAYER_SPEED, TILE, CANVAS_H } from './constants';
import type { CharId, PowerupType } from './constants';
import type { LevelData } from './levels';

export interface Rect { x: number; y: number; w: number; h: number; }

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

export interface ActivePowerup {
  type: PowerupType;
  expiresAt: number;
}

export class Player {
  x: number; y: number;
  vx = 0; vy = 0;
  w = 28; h = 30;
  onGround = false;
  jumpsLeft = 1;
  alive = true;
  score = 0;
  coins = 0;
  facing = 1;
  charId: CharId;
  activePowerups: ActivePowerup[] = [];
  invincible = false;
  invincibleUntil = 0;
  animFrame = 0;
  animTimer = 0;
  index: number; // 0 = P1, 1 = P2
  controls: { left: string; right: string; jump: string };

  constructor(x: number, y: number, charId: CharId, index: number) {
    this.x = x; this.y = y;
    this.charId = charId;
    this.index = index;
    this.controls = index === 0
      ? { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' }
      : { left: 'a', right: 'd', jump: 'w' };
  }

  hasPowerup(type: PowerupType): boolean {
    const now = Date.now();
    return this.activePowerups.some(p => p.type === type && p.expiresAt > now);
  }

  get speed() { return this.hasPowerup('speed') ? PLAYER_SPEED * 1.7 : PLAYER_SPEED; }
  get maxジャンプs() { return this.hasPowerup('double_jump') ? 2 : 1; }
  get isInvincible() { return Date.now() < this.invincibleUntil || this.hasPowerup('star') || this.hasPowerup('shield'); }

  update(keys: Set<string>, platforms: Platform[], dt: number) {
    if (!this.alive) return;

    // Clean expired powerups
    const now = Date.now();
    this.activePowerups = this.activePowerups.filter(p => p.expiresAt > now);

    // Horizontal
    if (keys.has(this.controls.left))  { this.vx = -this.speed; this.facing = -1; }
    else if (keys.has(this.controls.right)) { this.vx =  this.speed; this.facing = 1; }
    else this.vx *= 0.75;

    // ジャンプ
    if ((keys.has(this.controls.jump) || keys.has(' ')) && this.index === 0) {
      if (this.onGround || this.jumpsLeft > 0) {
        this.vy = JUMP_FORCE;
        this.onGround = false;
        this.jumpsLeft--;
      }
    }

    // Gravity
    this.vy += GRAVITY;
    if (this.vy > 18) this.vy = 18;

    // 移動 X
    this.x += this.vx;
    this.x = Math.max(0, this.x);

    // 移動 Y
    this.onGround = false;
    this.y += this.vy;

    // Platform collision
    for (const plat of platforms) {
      if (rectsOverlap({ x: this.x, y: this.y, w: this.w, h: this.h }, plat)) {
        const prevBottom = this.y + this.h - this.vy;
        if (this.vy >= 0 && prevBottom <= plat.y + 2) {
          this.y = plat.y - this.h;
          this.vy = 0;
          this.onGround = true;
          this.jumpsLeft = this.maxジャンプs;
        } else if (this.vy < 0 && this.y > plat.y) {
          this.y = plat.y + plat.h;
          this.vy = 1;
        }
      }
    }

    // Fall death
    if (this.y > CANVAS_H + 100) {
      if (!this.hasPowerup('shield')) {
        this.alive = false;
      } else {
        // Shield saves from fall
        this.y = -50;
      }
    }

    // Animation
    this.animTimer++;
    if (this.animTimer > 8) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
  }

  jump() {
    if (this.onGround || this.jumpsLeft > 0) {
      this.vy = JUMP_FORCE;
      this.onGround = false;
      this.jumpsLeft--;
    }
  }
}

export class Platform {
  x: number; y: number; w: number; h: number;
  type: 'normal' | 'cloud' | 'moving' | 'spike';
  baseX: number;
  moveDir = 1;
  moveRange = 120;
  moveSpeed = 1.2;

  constructor(x: number, y: number, w: number, type: 'normal' | 'cloud' | 'moving' | 'spike' = 'normal') {
    this.x = x; this.y = y; this.w = w; this.h = TILE;
    this.type = type; this.baseX = x;
  }

  update() {
    if (this.type !== 'moving') return;
    this.x += this.moveSpeed * this.moveDir;
    if (this.x > this.baseX + this.moveRange || this.x < this.baseX - this.moveRange) {
      this.moveDir *= -1;
    }
  }
}

export class Coin {
  x: number; y: number;
  w = 16; h = 16;
  collected = false;
  animFrame = 0;
  animTimer = 0;

  constructor(x: number, y: number) { this.x = x; this.y = y; }

  update() {
    this.animTimer++;
    if (this.animTimer > 6) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 6; }
  }
}

export class Powerup {
  x: number; y: number;
  w = 22; h = 22;
  type: PowerupType;
  collected = false;
  bobOffset = 0;
  bobDir = 1;

  constructor(x: number, y: number, type: string) {
    this.x = x; this.y = y;
    this.type = type as PowerupType;
  }

  update() {
    this.bobOffset += 0.05 * this.bobDir;
    if (Math.abs(this.bobOffset) > 4) this.bobDir *= -1;
  }
}

export class Enemy {
  x: number; y: number;
  w = 28; h = 28;
  vx: number; vy = 0;
  alive = true;
  type: 'walk' | 'fly' | 'jump';
  facing = -1;
  animFrame = 0;
  animTimer = 0;
  baseX: number;
  jumpTimer = 0;

  constructor(x: number, y: number, type: 'walk' | 'fly' | 'jump') {
    this.x = x; this.y = y; this.type = type; this.baseX = x;
    this.vx = type === 'fly' ? 1.5 : 1.2;
  }

  update(platforms: Platform[]) {
    if (!this.alive) return;

    this.animTimer++;
    if (this.animTimer > 8) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }

    if (this.type === 'fly') {
      // Flying — horizontal patrol
      this.x += this.vx * this.facing;
      if (this.x < this.baseX - 100 || this.x > this.baseX + 100) this.facing *= -1;
      return;
    }

    if (this.type === 'jump') {
      this.jumpTimer++;
      if (this.jumpTimer > 80 && this.vy === 0) {
        this.vy = -9;
        this.jumpTimer = 0;
      }
    }

    this.vy += GRAVITY;
    if (this.vy > 16) this.vy = 16;
    this.x += this.vx * this.facing;
    this.y += this.vy;

    // Platform collision + edge reversal
    let onGround = false;
    for (const plat of platforms) {
      if (rectsOverlap({ x: this.x, y: this.y, w: this.w, h: this.h }, plat)) {
        if (this.vy >= 0) {
          this.y = plat.y - this.h;
          this.vy = 0;
          onGround = true;
        }
      }
    }

    // Patrol reversal
    if (Math.abs(this.x - this.baseX) > 80) this.facing *= -1;

    // Fall off edge → reverse
    if (onGround) {
      const edgeCheck = { x: this.x + this.facing * (this.w + 2), y: this.y + this.h + 4, w: 2, h: 4 };
      const onEdge = platforms.some(p => rectsOverlap(edgeCheck, p));
      if (!onEdge) this.facing *= -1;
    }
  }
}

export function buildLevel(data: LevelData) {
  const platforms = data.platforms.map(p =>
    new Platform(p.x, p.y, p.w, p.type || 'normal')
  );
  const coins = data.coins.map(c => new Coin(c.x, c.y));
  const powerups = data.powerups.map(p => new Powerup(p.x, p.y, p.type));
  const enemies = data.enemies.map(e => new Enemy(e.x, e.y, e.type));
  return { platforms, coins, powerups, enemies };
}
