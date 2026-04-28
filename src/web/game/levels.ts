import { TILE } from './constants';

export interface LevelData {
  id: number;
  name: string;
  bgColors: [string, string];
  platforms: { x: number; y: number; w: number; type?: 'normal' | 'cloud' | 'moving' | 'spike' }[];
  coins: { x: number; y: number }[];
  powerups: { x: number; y: number; type: string }[];
  enemies: { x: number; y: number; type: 'walk' | 'fly' | 'jump' }[];
  goal: { x: number; y: number };
  spawnX: number;
  spawnY: number;
  width: number;
}

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: 'Sunrise Island',
    bgColors: ['#87CEEB', '#FFF4CC'],
    width: 3200,
    spawnX: 80, spawnY: 300,
    goal: { x: 3100, y: 200 },
    platforms: [
      // Ground sections
      { x: 0,    y: 400, w: 400 },
      { x: 450,  y: 400, w: 300 },
      { x: 800,  y: 380, w: 200 },
      { x: 1060, y: 360, w: 180 },
      { x: 1300, y: 340, w: 250, type: 'cloud' },
      { x: 1610, y: 360, w: 200 },
      { x: 1870, y: 340, w: 180 },
      { x: 2100, y: 320, w: 200 },
      { x: 2360, y: 300, w: 220, type: 'cloud' },
      { x: 2640, y: 320, w: 200 },
      { x: 2890, y: 280, w: 350 },
      // Elevated platforms
      { x: 200,  y: 300, w: 120 },
      { x: 600,  y: 280, w: 100, type: 'cloud' },
      { x: 900,  y: 260, w: 120 },
      { x: 1150, y: 240, w: 100, type: 'cloud' },
      { x: 2000, y: 200, w: 120 },
    ],
    coins: [
      {x:220,y:260},{x:252,y:260},{x:284,y:260},
      {x:620,y:240},{x:652,y:240},
      {x:920,y:220},{x:952,y:220},
      {x:1320,y:300},{x:1352,y:300},{x:1384,y:300},
      {x:2380,y:260},{x:2412,y:260},{x:2444,y:260},
      {x:2910,y:240},{x:2942,y:240},{x:2974,y:240},
    ],
    powerups: [
      { x: 636, y: 230, type: 'star' },
      { x: 1370, y: 290, type: 'shield' },
      { x: 2010, y: 160, type: 'double_jump' },
    ],
    enemies: [
      { x: 150, y: 368, type: 'walk' },
      { x: 500, y: 368, type: 'walk' },
      { x: 1000, y: 348, type: 'walk' },
      { x: 1700, y: 328, type: 'walk' },
      { x: 2200, y: 288, type: 'fly' },
      { x: 2500, y: 268, type: 'jump' },
      { x: 2700, y: 288, type: 'walk' },
    ],
  },
  {
    id: 2,
    name: 'Crystal Caves',
    bgColors: ['#1a0533', '#3d1a7a'],
    width: 3600,
    spawnX: 80, spawnY: 350,
    goal: { x: 3500, y: 200 },
    platforms: [
      { x: 0,    y: 420, w: 300 },
      { x: 360,  y: 400, w: 200 },
      { x: 620,  y: 370, w: 180 },
      { x: 860,  y: 340, w: 200 },
      { x: 1120, y: 320, w: 150, type: 'moving' },
      { x: 1360, y: 300, w: 200 },
      { x: 1620, y: 280, w: 180 },
      { x: 1860, y: 260, w: 200 },
      { x: 2120, y: 300, w: 150, type: 'moving' },
      { x: 2360, y: 280, w: 200 },
      { x: 2620, y: 260, w: 180 },
      { x: 2860, y: 240, w: 200 },
      { x: 3120, y: 260, w: 150, type: 'moving' },
      { x: 3340, y: 240, w: 250 },
      { x: 200,  y: 320, w: 100, type: 'cloud' },
      { x: 750,  y: 280, w: 100, type: 'cloud' },
      { x: 1500, y: 220, w: 100, type: 'cloud' },
      { x: 2500, y: 200, w: 100, type: 'cloud' },
    ],
    coins: [
      {x:380,y:360},{x:412,y:360},{x:444,y:360},
      {x:640,y:330},{x:672,y:330},
      {x:1140,y:280},{x:1172,y:280},{x:1204,y:280},
      {x:1640,y:240},{x:1672,y:240},
      {x:2380,y:240},{x:2412,y:240},{x:2444,y:240},
      {x:3360,y:200},{x:3392,y:200},{x:3424,y:200},{x:3456,y:200},
    ],
    powerups: [
      { x: 878, y: 300, type: 'speed' },
      { x: 1878, y: 220, type: 'shield' },
      { x: 2878, y: 200, type: 'coin_magnet' },
    ],
    enemies: [
      { x: 180, y: 388, type: 'walk' },
      { x: 400, y: 368, type: 'walk' },
      { x: 700, y: 338, type: 'fly' },
      { x: 1000, y: 308, type: 'jump' },
      { x: 1400, y: 268, type: 'walk' },
      { x: 1700, y: 248, type: 'fly' },
      { x: 2100, y: 268, type: 'jump' },
      { x: 2400, y: 248, type: 'walk' },
      { x: 2700, y: 228, type: 'fly' },
      { x: 3000, y: 228, type: 'jump' },
    ],
  },
  {
    id: 3,
    name: 'Sky Castle',
    bgColors: ['#ff9a9e', '#fecfef'],
    width: 4000,
    spawnX: 80, spawnY: 300,
    goal: { x: 3900, y: 180 },
    platforms: [
      { x: 0,    y: 380, w: 250 },
      { x: 310,  y: 360, w: 180, type: 'moving' },
      { x: 550,  y: 340, w: 200 },
      { x: 810,  y: 300, w: 180 },
      { x: 1060, y: 280, w: 200, type: 'cloud' },
      { x: 1320, y: 260, w: 180 },
      { x: 1560, y: 240, w: 200, type: 'moving' },
      { x: 1820, y: 260, w: 180 },
      { x: 2060, y: 240, w: 200 },
      { x: 2320, y: 220, w: 180, type: 'cloud' },
      { x: 2560, y: 240, w: 200, type: 'moving' },
      { x: 2820, y: 220, w: 180 },
      { x: 3060, y: 200, w: 200 },
      { x: 3320, y: 220, w: 180, type: 'moving' },
      { x: 3560, y: 200, w: 250 },
      { x: 3820, y: 220, w: 250 },
    ],
    coins: [
      {x:330,y:320},{x:362,y:320},{x:394,y:320},
      {x:570,y:300},{x:602,y:300},{x:634,y:300},
      {x:1080,y:240},{x:1112,y:240},{x:1144,y:240},
      {x:2340,y:180},{x:2372,y:180},{x:2404,y:180},
      {x:3080,y:160},{x:3112,y:160},{x:3144,y:160},{x:3176,y:160},
      {x:3840,y:180},{x:3872,y:180},{x:3904,y:180},
    ],
    powerups: [
      { x: 828, y: 260, type: 'star' },
      { x: 1578, y: 200, type: 'double_jump' },
      { x: 2578, y: 200, type: 'speed' },
      { x: 3580, y: 160, type: 'shield' },
    ],
    enemies: [
      { x: 100,  y: 348, type: 'walk' },
      { x: 340,  y: 328, type: 'jump' },
      { x: 600,  y: 308, type: 'walk' },
      { x: 850,  y: 268, type: 'fly' },
      { x: 1100, y: 248, type: 'jump' },
      { x: 1370, y: 228, type: 'walk' },
      { x: 1600, y: 208, type: 'fly' },
      { x: 1870, y: 228, type: 'jump' },
      { x: 2100, y: 208, type: 'fly' },
      { x: 2370, y: 188, type: 'walk' },
      { x: 2610, y: 208, type: 'jump' },
      { x: 2870, y: 188, type: 'fly' },
      { x: 3110, y: 168, type: 'walk' },
    ],
  },
];
