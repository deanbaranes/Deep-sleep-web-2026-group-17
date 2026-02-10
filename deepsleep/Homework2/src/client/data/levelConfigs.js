// --- Assets / configurations for levels ---
// Now including 'env' for distinct visuals and 'behavior' for distinct mechanics
export const LEVEL_CONFIGS = [
    // Day 1: Basic Asteroids - Linear movement, simple shapes
    {
        name: 'Emerald Prime',
        color: '#4ade80',
        difficulty: 1,
        duration: 30, // Increased from 20
        env: 'asteroids',
        desc: 'Navigating dense asteroid field.'
    },
    // Day 2: Space Debris - Metallic squares, some rotation
    {
        name: 'Neptune-7',
        color: '#60a5fa',
        difficulty: 1.2,
        duration: 40, // Increased from 25
        env: 'debris',
        desc: 'Industrial debris detected.'
    },
    // Day 3: Crystal Shards - Sharp triangles, faster
    {
        name: 'Ruby Star',
        color: '#f472b6',
        difficulty: 1.5,
        duration: 45, // Increased from 30
        env: 'crystals',
        desc: 'Crystal storms ahead.'
    },
    // Day 4: Alien Mines - Pulsing, slightly floating up/down
    {
        name: 'Gold Horizon',
        color: '#fbbf24',
        difficulty: 1.8,
        duration: 55, // Increased from 35
        env: 'mines',
        desc: 'Avoid automated defense mines.'
    },
    // Day 5: Quantum Clouds - Semi-transparent, drift randomly
    {
        name: 'Violet Nebula',
        color: '#a78bfa',
        difficulty: 2.2,
        duration: 60, // Increased from 40
        env: 'nebula',
        desc: 'Visibility low. Quantum instability.'
    },
    // Day 6: Repeat / Mix
    { name: 'Mars Outpost', color: '#f87171', difficulty: 2.5, duration: 70, env: 'asteroids', desc: 'Heavy asteroid belt.' },
    { name: 'Cyan Belt', color: '#2dd4bf', difficulty: 3.0, duration: 80, env: 'mines', desc: 'Advanced minefield.' },
    { name: 'The Void', color: '#fff', difficulty: 3.5, duration: 90, env: 'crystals', desc: 'Hyper-speed crystal zone.' },
];
