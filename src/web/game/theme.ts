export const THEME = {
  name: 'Moon Base',
  bgColors: ['#0a0a1a', '#1a0a2e'] as [string, string],
  gravity: 0.28,          // low gravity on moon!
  jumpForce: -10,
  characters: [
    { id: 'astro',   name: 'Astro',    color: '#e0e0e0', accent: '#4fc3f7', ear: '#b0bec5' },
    { id: 'cosmo',   name: 'Cosmo',    color: '#ce93d8', accent: '#fff9c4', ear: '#ab47bc' },
    { id: 'rocket',  name: 'Rocket',   color: '#ef9a9a', accent: '#fff8e1', ear: '#e53935' },
  ],
  platformColor:   ['#37474f', '#455a64'],
  platformAccent:  '#546e7a',
  coinColor:       '#80deea',
  bgStars:         true,
  enemyColors: {
    walk: { body: '#4caf50', eye: '#fff', accent: '#1b5e20' },
    fly:  { body: '#9c27b0', eye: '#e1bee7', accent: '#6a1b9a' },
    jump: { body: '#ff5722', eye: '#fff', accent: '#bf360c' },
  },
  powerupEmojis: { star: '🌟', shield: '🛸', speed: '🚀', double_jump: '🌙', coin_magnet: '☄️' },
  levelNames: ['Mare Imbrium', 'Crater Valley', 'Dark Side'],
  levelBgs: [
    ['#0a0a1a', '#1a1a3a'] as [string, string],
    ['#0d0d2b', '#0a2040'] as [string, string],
    ['#050510', '#0a0520'] as [string, string],
  ],
};
