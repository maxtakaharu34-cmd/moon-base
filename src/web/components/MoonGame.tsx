import { useRef, useEffect, useCallback, useState } from 'react';
import { CANVAS_W, CANVAS_H, POWERUP_CONFIG } from '../game/constants';
import type { CharId } from '../game/constants';
import { Player, Platform, Coin, Powerup, Enemy, buildLevel, rectsOverlap } from '../game/entities';
import { MOON_レベルS } from '../game/moonLevels';
import { THEME } from '../game/theme';
import {
  drawMoonBackground, drawMoonPlatform, drawMoonCoin,
  drawMoonPowerup, drawMoonEnemy, drawMoonPlayer,
} from '../game/moonRenderer';
import { initAudio, sfxジャンプ, sfxCoin, sfxHit, sfxPowerup, sfxDie, sfxClear, sfxStep } from '../game/sounds';

// Override gravity/jump for moon physics
const MOON_GRAVITY = 0.28;
const MOON_JUMP = -10;

type Screen = 'menu' | 'playing' | 'level_complete' | 'gameover' | 'board';
type Mode = 'single' | 'multi';

interface LeaderEntry { name: string; score: number; coins: number; date: string; }
function getBoard(): LeaderEntry[] { try { return JSON.parse(localStorage.getItem('moonBaseBoard') || '[]'); } catch { return []; } }
function saveScore(e: LeaderEntry) {
  const b = getBoard(); b.push(e); b.sort((a, b) => b.score - a.score);
  localStorage.setItem('moonBaseBoard', JSON.stringify(b.slice(0, 10)));
}

export default function MoonGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<Mode>('single');
  const [p1Char, setP1Char] = useState<string>('astro');
  const [p2Char, setP2Char] = useState<string>('cosmo');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [board, setBoard] = useState<LeaderEntry[]>([]);
  const [soundOn, setSoundOn] = useState(true);

  const screenRef = useRef<Screen>('menu');
  const keysRef = useRef<Set<string>>(new Set());
  const playersRef = useRef<Player[]>([]);
  const platformsRef = useRef<Platform[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const camXRef = useRef(0);
  const levelRef = useRef(1);
  const soundRef = useRef(true);
  const animRef = useRef(0);
  const levelDataRef = useRef(MOON_レベルS[0]);

  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  const sfx = useCallback((fn: () => void) => { if (soundRef.current) fn(); }, []);

  const loadLevel = useCallback((idx: number, chars: string[], gm: Mode) => {
    const data = MOON_レベルS[idx];
    levelDataRef.current = data;
    const { platforms, coins, powerups, enemies } = buildLevel(data);
    platformsRef.current = platforms;
    coinsRef.current = coins;
    powerupsRef.current = powerups;
    enemiesRef.current = enemies;
    camXRef.current = 0;
    const p1 = new Player(data.spawnX, data.spawnY, chars[0] as CharId, 0);
    const p2 = gm === 'multi' ? new Player(data.spawnX + 40, data.spawnY, chars[1] as CharId, 1) : null;
    playersRef.current = p2 ? [p1, p2] : [p1];
  }, []);

  const startGame = useCallback((lvl = 1) => {
    initAudio(); levelRef.current = lvl; setCurrentLevel(lvl);
    loadLevel(lvl - 1, [p1Char, p2Char], mode);
    setScreen('playing');
  }, [loadLevel, p1Char, p2Char, mode]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (['ArrowUp', ' ', 'w'].includes(e.key)) e.preventDefault();
      if (['ArrowUp', ' '].includes(e.key)) {
        const p = playersRef.current[0];
        if (p && (p.onGround || p.jumpsLeft > 0)) { p.jump(); sfx(sfxジャンプ); }
      }
      if (e.key === 'w') {
        const p = playersRef.current[1];
        if (p && (p.onGround || p.jumpsLeft > 0)) { p.jump(); sfx(sfxジャンプ); }
      }
      if (e.key === 'Enter') {
        if (screenRef.current === 'level_complete') {
          const next = levelRef.current + 1;
          if (next <= MOON_レベルS.length) startGame(next); else setScreen('menu');
        }
        if (screenRef.current === 'gameover') startGame(levelRef.current);
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [sfx, startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W; canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;
    let stepT = 0;

    const loop = () => {
      animRef.current = requestAnimationFrame(loop);
      const s = screenRef.current;
      const lvl = levelDataRef.current;
      drawMoonBackground(ctx, lvl.bgColors, camXRef.current);
      if (s !== 'playing') {
        if (s === 'level_complete' || s === 'gameover') drawOverlay(ctx, s, levelRef.current, playersRef.current);
        return;
      }

      const keys = keysRef.current;
      const players = playersRef.current;
      const platforms = platformsRef.current;

      platforms.forEach(p => p.update());

      players.forEach(p => {
        if (!p.alive) return;
        // Override gravity in entity.update via custom gravity patch
        const saved = { vy: p.vy };

        if (keys.has(p.controls.left))  { p.vx = -3.8; p.facing = -1; }
        else if (keys.has(p.controls.right)) { p.vx = 3.8; p.facing = 1; }
        else p.vx *= 0.75;

        p.vy += MOON_GRAVITY;
        if (p.vy > 14) p.vy = 14;
        p.x += p.vx; p.x = Math.max(0, p.x);
        p.onGround = false; p.y += p.vy;

        for (const plat of platforms) {
          if (rectsOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, plat)) {
            const prev = p.y + p.h - p.vy;
            if (p.vy >= 0 && prev <= plat.y + 2) {
              p.y = plat.y - p.h; p.vy = 0; p.onGround = true;
              p.jumpsLeft = p.maxジャンプs;
            } else if (p.vy < 0 && p.y > plat.y) { p.y = plat.y + plat.h; p.vy = 1; }
          }
        }

        if (p.y > CANVAS_H + 100) {
          if (!p.hasPowerup('shield')) p.alive = false; else p.y = -50;
        }

        p.animTimer++;
        if (p.animTimer > 8) { p.animTimer = 0; p.animFrame = (p.animFrame + 1) % 4; }
        const now = Date.now();
        p.activePowerups = p.activePowerups.filter(ap => ap.expiresAt > now);

        coinsRef.current.forEach(c => {
          if (c.collected) return;
          if (rectsOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: c.x, y: c.y, w: c.w, h: c.h }) ||
              (p.hasPowerup('coin_magnet') && Math.hypot(p.x - c.x, p.y - c.y) < 80)) {
            c.collected = true; p.coins++; p.score += 10; sfx(sfxCoin);
          }
        });

        powerupsRef.current.forEach(pu => {
          if (pu.collected) return;
          if (rectsOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: pu.x, y: pu.y, w: pu.w, h: pu.h })) {
            pu.collected = true;
            p.activePowerups.push({ type: pu.type, expiresAt: Date.now() + POWERUP_CONFIG[pu.type].duration });
            sfx(sfxPowerup);
          }
        });

        enemiesRef.current.forEach(e => {
          if (!e.alive) return;
          if (!rectsOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, { x: e.x, y: e.y, w: e.w, h: e.h })) return;
          if (p.vy > 0 && p.y + p.h < e.y + e.h * 0.4 || p.hasPowerup('star')) {
            e.alive = false; p.vy = -8; p.score += 50; sfx(sfxHit);
          } else if (!p.isInvincible) {
            if (p.hasPowerup('shield')) {
              p.activePowerups = p.activePowerups.filter(ap => ap.type !== 'shield');
              p.invincibleUntil = Date.now() + 1500;
            } else { p.alive = false; sfx(sfxDie); }
          }
        });

        if (p.onGround && (keys.has('ArrowLeft') || keys.has('ArrowRight') || keys.has('a') || keys.has('d'))) {
          stepT++; if (stepT % 18 === 0) sfx(sfxStep);
        }

        const gr = { x: lvl.goal.x, y: lvl.goal.y, w: 30, h: 60 };
        if (rectsOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, gr)) {
          p.score += 200; sfx(sfxClear);
          saveScore({ name: `P1-${p.charId}`, score: p.score, coins: p.coins, date: new Date().toLocaleDateString() });
          setScreen('level_complete'); return;
        }
      });

      if (players.length > 0 && players.every(p => !p.alive)) { setScreen('gameover'); return; }

      coinsRef.current.forEach(c => c.update());
      powerupsRef.current.forEach(pu => pu.update());
      enemiesRef.current.forEach(e => e.update(platforms));

      const p1 = players[0];
      if (p1) {
        const target = p1.x - CANVAS_W / 3;
        camXRef.current += (target - camXRef.current) * 0.1;
        camXRef.current = Math.max(0, Math.min(camXRef.current, lvl.width - CANVAS_W));
      }

      ctx.save(); ctx.translate(-camXRef.current, 0);
      platforms.forEach(p => drawMoonPlatform(ctx, p));
      coinsRef.current.forEach(c => drawMoonCoin(ctx, c));
      powerupsRef.current.forEach(pu => drawMoonPowerup(ctx, pu));
      enemiesRef.current.forEach(e => drawMoonEnemy(ctx, e));
      players.forEach(p => drawMoonPlayer(ctx, p, THEME.characters));
      drawGoalFlag(ctx, lvl.goal);
      ctx.restore();

      drawMoonHUD(ctx, players, levelRef.current, MOON_レベルS.length);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [sfx]);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <canvas ref={canvasRef}
        className="rounded-xl shadow-2xl border-2 border-cyan-700"
        style={{ maxWidth: '100%', imageRendering: 'pixelated' }}
      />

      {screen === 'menu' && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="flex gap-2">
            {(['single', 'multi'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${mode === m ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
                {m === 'single' ? '1 Player' : '2 Players'}
              </button>
            ))}
          </div>
          <div className="w-full">
            <p className="text-cyan-400 text-xs mb-1 text-center">P1 Astronaut</p>
            <div className="flex justify-center gap-2">
              {THEME.characters.map(c => (
                <button key={c.id} onClick={() => setP1Char(c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${p1Char === c.id ? 'border-yellow-400 scale-110' : 'border-gray-600'}`}
                  style={{ background: c.color + '22', color: c.color }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          {mode === 'multi' && (
            <div className="w-full">
              <p className="text-cyan-400 text-xs mb-1 text-center">P2 Astronaut</p>
              <div className="flex justify-center gap-2">
                {THEME.characters.map(c => (
                  <button key={c.id} onClick={() => setP2Char(c.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${p2Char === c.id ? 'border-yellow-400 scale-110' : 'border-gray-600'}`}
                    style={{ background: c.color + '22', color: c.color }}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => startGame(1)}
              className="px-8 py-3 bg-gradient-to-r from-cyan-700 to-blue-700 text-white rounded-xl text-lg font-bold hover:scale-105 transition-transform shadow-lg">
              🚀 Launch
            </button>
            <button onClick={() => { setBoard(getBoard()); setScreen('board'); }}
              className="px-4 py-3 bg-gray-700 text-yellow-400 rounded-xl text-sm font-bold hover:bg-gray-600">
              🏆 Scores
            </button>
            <button onClick={() => setSoundOn(s => !s)}
              className="px-4 py-3 bg-gray-700 text-white rounded-xl text-sm hover:bg-gray-600">
              {soundOn ? '🔊' : '🔇'}
            </button>
          </div>
          <p className="text-gray-500 text-xs">P1: ←→ 移動 · ↑ ジャンプ | P2: A D 移動 · W ジャンプ</p>
        </div>
      )}

      {screen === 'board' && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <h3 className="text-yellow-400 font-bold text-lg">🏆 月面基地 Scores</h3>
          <div className="w-full bg-gray-800 rounded-xl overflow-hidden">
            {board.length === 0
              ? <p className="text-gray-400 text-center p-4 text-sm">No scores yet</p>
              : board.map((e, i) => (
                <div key={i} className="flex gap-3 px-4 py-2 border-b border-gray-700 last:border-0">
                  <span className="text-yellow-400 font-bold w-6 text-sm">{i + 1}</span>
                  <span className="text-white text-sm flex-1">{e.name}</span>
                  <span className="text-cyan-400 font-bold text-sm">{e.score}pt</span>
                </div>
              ))
            }
          </div>
          <button onClick={() => setScreen('menu')} className="px-6 py-2 bg-cyan-800 text-white rounded-lg font-bold hover:bg-cyan-700">← Back</button>
        </div>
      )}

      {screen === 'playing' && (
        <div className="flex flex-col gap-2 md:hidden w-full max-w-xs">
          <div className="flex justify-center">
            <button onTouchStart={(e) => { e.preventDefault(); playersRef.current[0]?.jump(); sfx(sfxジャンプ); }}
              className="w-14 h-14 bg-cyan-800 rounded-xl text-2xl font-bold text-white active:bg-cyan-600 flex items-center justify-center">↑</button>
          </div>
          <div className="flex justify-center gap-3">
            <button onTouchStart={(e) => { e.preventDefault(); keysRef.current.add('ArrowLeft'); }}
              onTouchEnd={(e) => { e.preventDefault(); keysRef.current.delete('ArrowLeft'); }}
              className="w-14 h-14 bg-cyan-800 rounded-xl text-2xl font-bold text-white active:bg-cyan-600 flex items-center justify-center">←</button>
            <button onTouchStart={(e) => { e.preventDefault(); keysRef.current.add('ArrowRight'); }}
              onTouchEnd={(e) => { e.preventDefault(); keysRef.current.delete('ArrowRight'); }}
              className="w-14 h-14 bg-cyan-800 rounded-xl text-2xl font-bold text-white active:bg-cyan-600 flex items-center justify-center">→</button>
          </div>
        </div>
      )}

      {screen === 'level_complete' && (
        <div className="flex gap-3">
          <button onClick={() => { const n = currentLevel + 1; if (n <= MOON_レベルS.length) startGame(n); else setScreen('menu'); }}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-transform">
            {currentLevel < MOON_レベルS.length ? '次のレベル →' : '🏠 Menu'}
          </button>
        </div>
      )}
      {screen === 'gameover' && (
        <div className="flex gap-3">
          <button onClick={() => startGame(currentLevel)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-700 to-blue-700 text-white rounded-xl font-bold hover:scale-105 transition-transform">
            もう一度
          </button>
          <button onClick={() => setScreen('menu')} className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600">メニュー</button>
        </div>
      )}
    </div>
  );
}

function drawGoalFlag(ctx: CanvasRenderingContext2D, goal: { x: number; y: number }) {
  ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(goal.x + 12, goal.y + 60); ctx.lineTo(goal.x + 12, goal.y); ctx.stroke();
  ctx.fillStyle = '#4fc3f7';
  ctx.beginPath(); ctx.moveTo(goal.x + 12, goal.y); ctx.lineTo(goal.x + 42, goal.y + 12); ctx.lineTo(goal.x + 12, goal.y + 24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.fillText('🚀', goal.x + 14, goal.y + 18);
  ctx.fillStyle = '#607d8b'; ctx.beginPath(); ctx.ellipse(goal.x + 12, goal.y + 62, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
}

function drawMoonHUD(ctx: CanvasRenderingContext2D, players: Player[], level: number, total: number) {
  players.forEach((p, i) => {
    const ox = i === 0 ? 10 : CANVAS_W - 180;
    ctx.fillStyle = 'rgba(0,20,40,0.6)';
    rr(ctx, ox, 8, 165, 52, 8); ctx.fill();
    ctx.fillStyle = '#4fc3f7'; ctx.font = 'bold 13px monospace';
    const char = THEME.characters.find(c => c.id === p.charId) || THEME.characters[0];
    ctx.fillText(`P${i + 1} ${char.name}`, ox + 10, 26);
    ctx.fillStyle = '#80deea'; ctx.font = 'bold 12px monospace';
    ctx.fillText(`✦ ${p.coins}`, ox + 10, 43);
    ctx.fillStyle = '#fff'; ctx.fillText(`${p.score}pt`, ox + 65, 43);
    const now = Date.now();
    p.activePowerups.forEach((ap, j) => {
      const emojis: Record<string, string> = { star: '🌟', shield: '🛸', speed: '🚀', double_jump: '🌙', coin_magnet: '☄️' };
      ctx.font = '13px Arial'; ctx.fillText(emojis[ap.type] || '⭐', ox + 110 + j * 22, 42);
    });
  });
  ctx.fillStyle = 'rgba(0,20,40,0.6)';
  rr(ctx, CANVAS_W / 2 - 60, 8, 120, 28, 8); ctx.fill();
  ctx.fillStyle = '#4fc3f7'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
  ctx.fillText(`レベル ${level} / ${total}`, CANVAS_W / 2, 26);
  ctx.textAlign = 'left';
}

function drawOverlay(ctx: CanvasRenderingContext2D, type: string, level: number, players: Player[]) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  if (type === 'level_complete') {
    ctx.fillStyle = '#4fc3f7'; ctx.font = 'bold 36px monospace'; ctx.fillText('🚀 CLEAR!', CANVAS_W / 2, CANVAS_H / 2 - 50);
    ctx.fillStyle = '#fff'; ctx.font = '16px monospace';
    ctx.fillText(`スコア: ${players[0]?.score || 0}`, CANVAS_W / 2, CANVAS_H / 2 - 10);
    ctx.fillText(`Coins: ✦ ${players[0]?.coins || 0}`, CANVAS_W / 2, CANVAS_H / 2 + 15);
    ctx.fillStyle = '#80deea'; ctx.font = '14px monospace';
    ctx.fillText('ENTERで次のレベル', CANVAS_W / 2, CANVAS_H / 2 + 55);
  } else {
    ctx.fillStyle = '#ef5350'; ctx.font = 'bold 34px monospace'; ctx.fillText('ゲームオーバー', CANVAS_W / 2, CANVAS_H / 2 - 40);
    ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.fillText(`スコア: ${players[0]?.score || 0}`, CANVAS_W / 2, CANVAS_H / 2);
    ctx.fillStyle = '#4fc3f7'; ctx.font = '14px monospace'; ctx.fillText('ENTERで再挑戦', CANVAS_W / 2, CANVAS_H / 2 + 40);
  }
  ctx.textAlign = 'left';
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
