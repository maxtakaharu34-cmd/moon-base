export const CANVAS_W = 800;
export const CANVAS_H = 450;
export const GRAVITY = 0.55;
export const JUMP_FORCE = -13;
export const PLAYER_SPEED = 3.8;
export const TILE = 32;

export const CHARACTERS = [
  { id: 'rabbit', name: 'Bunny', color: '#f5f5f5', accent: '#ffb6c1', ear: '#ff9eb5', unlocked: true },
  { id: 'fox',    name: 'Fox',   color: '#ff8c42', accent: '#fff3e0', ear: '#cc5500', unlocked: true },
  { id: 'penguin',name: 'Pengu', color: '#2c3e7a', accent: '#f0f0f0', ear: '#ffd700', unlocked: true },
  { id: 'bear',   name: 'Bear',  color: '#8B6914', accent: '#f5deb3', ear: '#5a3e00', unlocked: false },
  { id: 'dragon', name: 'Dragon',color: '#27ae60', accent: '#a8e063', ear: '#196f3d', unlocked: false },
] as const;

export type CharId = typeof CHARACTERS[number]['id'];

export const POWERUP_TYPES = ['star', 'shield', 'speed', 'double_jump', 'coin_magnet'] as const;
export type PowerupType = typeof POWERUP_TYPES[number];

export const POWERUP_CONFIG: Record<PowerupType, { color: string; label: string; duration: number }> = {
  star:        { color: '#FFD700', label: '⭐',  duration: 8000 },
  shield:      { color: '#00BFFF', label: '🛡',  duration: 6000 },
  speed:       { color: '#FF4500', label: '💨',  duration: 7000 },
  double_jump: { color: '#DA70D6', label: '✦',   duration: 10000 },
  coin_magnet: { color: '#FFD700', label: '🧲',  duration: 8000 },
};
