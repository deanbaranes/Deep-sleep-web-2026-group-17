import { useEffect, useRef, useState } from 'react';

// --- Assets / configurations for levels ---
// Now including 'env' for distinct visuals and 'behavior' for distinct mechanics
const LEVEL_CONFIGS = [
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

export default function GalacticGame({ dayCount, onClose }) {
    // --- State ---
    const [view, setView] = useState('map'); // 'map', 'game', 'win', 'lose', 'locked'
    const [currentLevel, setCurrentLevel] = useState(dayCount);

    const [attempts, setAttempts] = useState(() => {
        const key = `galactic_voyage_attempts_day_${dayCount}`;
        const saved = localStorage.getItem(key);
        return saved ? parseInt(saved, 10) : 0;
    });

    const MAX_ATTEMPTS = 3;

    // Save attempts
    useEffect(() => {
        const key = `galactic_voyage_attempts_day_${dayCount}`;
        localStorage.setItem(key, attempts.toString());
    }, [attempts, dayCount]);


    // --- Handlers ---
    const startLevel = (levelIdx) => {
        if (attempts >= MAX_ATTEMPTS) {
            setView('locked');
            return;
        }
        setAttempts(prev => prev + 1);
        setCurrentLevel(levelIdx);
        setView('game');
    };

    const handleWin = () => setView('win');
    const handleLose = () => setView('lose');

    return (
        <div className="relative w-full max-w-4xl mx-auto h-[600px] bg-black rounded-3xl overflow-hidden border-2 border-indigo-600 shadow-[0_0_50px_rgba(79,70,229,0.4)]">

            {/* Header / HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="text-indigo-300 font-mono text-sm bg-black/50 px-3 py-1 rounded border border-indigo-900">
                        DAY {dayCount} // ATTEMPTS: <span className={attempts >= MAX_ATTEMPTS ? 'text-red-500' : 'text-cyan-400'}>{attempts}/{MAX_ATTEMPTS}</span>
                    </div>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 hidden sm:block">
                    GALACTIC VOYAGE
                </h1>
                <button onClick={onClose} className="pointer-events-auto bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1 rounded-lg text-sm border border-red-800/50 transition-colors">
                    Exit
                </button>
            </div>

            {/* Views Router */}
            <div className="w-full h-full pt-16 pb-4 px-4 overflow-y-auto custom-scrollbar">
                {view === 'map' && (
                    <MapLevelSelect
                        currentDay={dayCount}
                        onSelectLevel={startLevel}
                        isLocked={attempts >= MAX_ATTEMPTS}
                    />
                )}

                {view === 'game' && (
                    <ActiveGameSession
                        levelIdx={currentLevel}
                        onWin={handleWin}
                        onLose={handleLose}
                        onBack={() => setView('map')}
                    />
                )}

                {view === 'win' && (
                    <WinScreen
                        levelIdx={currentLevel}
                        onBack={() => setView('map')}
                        isCurrentDay={currentLevel === dayCount}
                    />
                )}

                {view === 'lose' && (
                    <LoseScreen
                        onRetry={() => startLevel(currentLevel)}
                        onBack={() => setView('map')}
                        attemptsLeft={MAX_ATTEMPTS - attempts}
                    />
                )}

                {view === 'locked' && (
                    <LockedScreen onClose={onClose} />
                )}
            </div>
        </div>
    );
}

// --- Sub-Components ---

function MapLevelSelect({ currentDay, onSelectLevel, isLocked }) {
    var lineGradient = "from-indigo-900 via-cyan-500/50 to-indigo-900";

    return (
        <div className="flex flex-col items-center justify-center min-h-full space-y-8 animate-fadeIn pb-10">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-widest text-shadow-glow">MISSION MAP</h2>
                <p className="text-gray-400 text-sm">Select your destination. New sectors unlock daily.</p>
            </div>

            <div className="relative w-full max-w-md p-8">
                {/* Connecting Line */}
                <div className={`absolute left-[33px] sm:left-1/2 top-8 bottom-8 w-1 bg-gradient-to-b ${lineGradient} transform sm:-translate-x-1/2 -z-10 rounded-full`}></div>

                <div className="space-y-6">
                    {Array.from({ length: 14 }).map((_, i) => {
                        const dayNum = i + 1;
                        const isUnlocked = dayNum <= currentDay;
                        const isCurrent = dayNum === currentDay;
                        const config = LEVEL_CONFIGS[(dayNum - 1) % LEVEL_CONFIGS.length];

                        return (
                            <button
                                key={dayNum}
                                disabled={!isUnlocked}
                                onClick={() => onSelectLevel(dayNum)}
                                className={`
                                    w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                    ${isUnlocked
                                        ? 'bg-black/60 hover:bg-white/5 border border-indigo-500/30 hover:border-indigo-400 cursor-pointer'
                                        : 'opacity-40 grayscale cursor-not-allowed border border-transparent'}
                                    ${isCurrent ? 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.15)] bg-indigo-900/30' : ''}
                                `}
                            >
                                <div className={`
                                    w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 shadow-lg z-20 shrink-0 transition-transform duration-300 group-hover:scale-110
                                    ${isUnlocked ? 'text-black' : 'bg-gray-800 text-gray-500 border-gray-700'}
                                    ${isCurrent && !isLocked ? 'animate-pulse' : ''}
                                `}
                                    style={{
                                        backgroundColor: isUnlocked ? config.color : undefined,
                                        borderColor: isUnlocked ? 'white' : undefined,
                                        boxShadow: isUnlocked ? `0 0 15px ${config.color}` : 'none'
                                    }}
                                >
                                    {isUnlocked ? dayNum : '🔒'}
                                </div>

                                <div className="text-left z-10 w-full overflow-hidden">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="text-indigo-200 font-bold text-lg group-hover:text-white transition-colors truncate pr-2">
                                            {isUnlocked ? config.name : `Sector ${dayNum}`}
                                        </div>
                                        {isUnlocked && (
                                            <div className="text-[10px] uppercase font-mono text-gray-400 border border-gray-700 px-1 rounded bg-black/50">
                                                {config.env}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-indigo-400/70 font-mono flex items-center gap-1">
                                        {isUnlocked ? (
                                            <span>{config.desc}</span>
                                        ) : 'LOCKED'}
                                    </div>
                                </div>

                                {isCurrent && (
                                    <div className="absolute right-3 bottom-2 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-1 rounded border border-cyan-500/50 animate-bounce-horizontal">
                                        START
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


function ActiveGameSession({ levelIdx, onWin, onLose, onBack }) {
    const canvasRef = useRef(null);
    const config = LEVEL_CONFIGS[(levelIdx - 1) % LEVEL_CONFIGS.length];

    const [timeLeft, setTimeLeft] = useState(config.duration);
    const [progress, setProgress] = useState(0);
    const [fuel, setFuel] = useState(100); // 0-100

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Init Check
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const ctx = canvas.getContext('2d');
        let frameId;
        let frames = 0;
        let startTime = Date.now();
        let isRunning = true;

        // Game Parameters
        const duration = config.duration;
        // Steeper difficulty scaling
        // Speed: 6.5 (lvl 1) -> ~14 (lvl 8)
        const speed = 6.5 + (config.difficulty * 2.5);

        // Spawn Rate: Faster! 40 frames -> 15 frames
        const spawnRate = Math.max(15, 50 - (config.difficulty * 12));

        // Fuel Params
        const fuelDrain = 0.1 + (config.difficulty * 0.02); // Drains ~6-10% per second
        const fuelSpawnRate = 180; // ~3 seconds

        // Objects
        const ship = { x: 50, y: canvas.height / 2, w: 40, h: 24, dy: 0 };
        const obstacles = [];
        const collectibles = [];
        const particles = [];

        // Background Stars
        const stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 8 + 2
        }));

        // Inputs
        const keys = { ArrowUp: false, ArrowDown: false };
        const handleDown = (e) => keys[e.code] = true;
        const handleUp = (e) => keys[e.code] = false;

        const handleTouch = (e) => {
            e.preventDefault();
            const y = e.touches[0].clientY;
            const myY = canvas.getBoundingClientRect().top;
            if (y < myY + canvas.height / 2) { keys.ArrowUp = true; keys.ArrowDown = false; }
            else { keys.ArrowDown = true; keys.ArrowUp = false; }
        };
        const handleTouchEnd = () => { keys.ArrowUp = false; keys.ArrowDown = false; };

        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        canvas.addEventListener('touchstart', handleTouch, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);

        // --- Helpers ---
        const createParticle = (x, y, color, type = 'spark') => {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4 - speed, // Move left with world
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color,
                type
            });
        };

        const createExplosion = (x, y, color) => {
            for (let i = 0; i < 20; i++) createParticle(x, y, color, 'explosion');
        };

        const drawJaggedAsteroid = (ctx, obs) => {
            // Generate vertices if not present (optimization: do this once on spawn ideally, but here for simplicity we seed it or store it)
            // We'll store vertices on spawn in real implementation, but for now deterministically hash or just store them
            if (!obs.vertices) {
                obs.vertices = [];
                const sides = 8 + Math.floor(Math.random() * 4);
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    const r = (obs.w / 2) * (0.6 + Math.random() * 0.4); // 60-100% radius
                    obs.vertices.push({
                        x: Math.cos(angle) * r,
                        y: Math.sin(angle) * r
                    });
                }
                // Crater
                obs.crater = {
                    x: (Math.random() - 0.5) * (obs.w / 4),
                    y: (Math.random() - 0.5) * (obs.h / 4),
                    r: obs.w / 6
                };
            }

            ctx.save();
            ctx.translate(obs.x + obs.w / 2, obs.y + obs.h / 2);
            ctx.rotate(obs.rot);

            ctx.fillStyle = '#4b5563'; // Gray 600
            ctx.beginPath();
            ctx.moveTo(obs.vertices[0].x, obs.vertices[0].y);
            obs.vertices.forEach(v => ctx.lineTo(v.x, v.y));
            ctx.closePath();
            ctx.fill();

            // Crater
            ctx.fillStyle = '#374151'; // Gray 700
            ctx.beginPath();
            ctx.arc(obs.crater.x, obs.crater.y, obs.crater.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        // Loop
        let currentFuel = 100;

        const render = () => {
            if (!isRunning) return;
            frames++;
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(0, duration - elapsed);

            // Fuel Drain
            currentFuel -= fuelDrain;
            if (currentFuel <= 0) {
                currentFuel = 0;
                isRunning = false;
                onLose();
                return;
            }
            // Sync React State rarely to avoid lag
            if (frames % 10 === 0) {
                setFuel(currentFuel);
                setTimeLeft(remaining);
                setProgress(((duration - remaining) / duration) * 100);
            }

            if (remaining <= 0) {
                isRunning = false;
                onWin();
                return;
            }

            // Resize
            if (canvas.width !== canvas.parentElement.clientWidth) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }

            // --- Draw ---
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            ctx.fillStyle = 'white';
            stars.forEach(s => {
                s.x -= s.speed * (speed * 0.1);
                if (s.x < 0) s.x = canvas.width;
                const flicker = Math.random() > 0.9 ? 0.3 : 1;
                ctx.globalAlpha = (Math.random() * 0.5 + 0.5) * flicker;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02; // Fade out
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.type === 'explosion' ? Math.random() * 3 : 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // --- Ship ---
            ship.y += ship.dy;
            if (ship.y < 0) ship.y = 0;
            if (ship.y + ship.h > canvas.height) ship.y = canvas.height - ship.h;

            if (keys.ArrowUp) ship.dy = -7;
            else if (keys.ArrowDown) ship.dy = 7;
            else ship.dy *= 0.9;

            // Engine Trail (every frame)
            createParticle(ship.x - 5, ship.y + ship.h / 2 + (Math.random() - 0.5) * 10, '#f59e0b'); // Orange
            createParticle(ship.x - 5, ship.y + ship.h / 2, '#ef4444'); // Red

            // Draw Detailed Ship
            ctx.save();
            ctx.translate(ship.x, ship.y);

            // Filters/Glow
            if (config.difficulty > 2) {
                ctx.shadowColor = config.color;
                ctx.shadowBlur = 20;
            }

            // Main Hull
            ctx.fillStyle = '#cbd5e1'; // Slate 300 base
            ctx.beginPath();
            ctx.moveTo(ship.w, ship.h / 2);
            ctx.lineTo(0, 0);
            ctx.lineTo(10, ship.h / 2); // Indent
            ctx.lineTo(0, ship.h);
            ctx.closePath();
            ctx.fill();

            // Cockpit / Stripe
            ctx.fillStyle = config.color;
            ctx.beginPath();
            ctx.moveTo(ship.w * 0.5, ship.h / 2 - 5);
            ctx.lineTo(ship.w * 0.8, ship.h / 2);
            ctx.lineTo(ship.w * 0.5, ship.h / 2 + 5);
            ctx.fill();

            ctx.restore();

            // --- Collectibles (Fuel) ---
            if (frames % fuelSpawnRate === 0) {
                collectibles.push({
                    x: canvas.width,
                    y: Math.random() * (canvas.height - 40),
                    w: 25, h: 25
                });
            }

            collectibles.forEach((c, i) => {
                c.x -= speed;

                // Draw Fuel (Glowing Orb)
                ctx.shadowColor = '#eab308';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 * Math.abs(Math.sin(frames * 0.1)) + 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Collision
                const hit = ship.x < c.x + c.w && ship.x + ship.w > c.x && ship.y < c.y + c.h && ship.y + ship.h > c.y;
                if (hit) {
                    currentFuel = Math.min(100, currentFuel + 25);
                    createExplosion(c.x, c.y, '#facc15');
                    collectibles.splice(i, 1);
                } else if (c.x < -50) {
                    collectibles.splice(i, 1);
                }
            });

            // --- Obstacles ---
            if (frames % Math.floor(spawnRate) === 0) {
                const activeDrift = config.env === 'mines' ? (Math.random() - 0.5) * 3 : 0;
                let obstacleType = config.env;
                // Mix types for diff > 1.5
                if (config.difficulty > 1.5 && Math.random() > 0.6) {
                    const types = ['asteroids', 'mines', 'crystals'];
                    obstacleType = types[Math.floor(Math.random() * types.length)];
                }

                obstacles.push({
                    x: canvas.width,
                    y: Math.random() * (canvas.height - 50),
                    w: 40 + Math.random() * 30, // Bigger
                    h: 40 + Math.random() * 30,
                    type: obstacleType,
                    drift: activeDrift,
                    rot: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.1
                });
            }

            obstacles.forEach((o, i) => {
                o.x -= speed;
                o.y += o.drift;
                o.rot += o.rotSpeed || 0;

                // Draw based on type
                if (o.type === 'mines') {
                    ctx.shadowColor = '#ef4444';
                    ctx.shadowBlur = 10 + Math.sin(frames * 0.2) * 5;
                    ctx.fillStyle = '#b91c1c';
                    ctx.beginPath();
                    ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.w / 3, 0, Math.PI * 2);
                    ctx.fill();
                    // Spikes
                    ctx.strokeStyle = '#f87171';
                    ctx.lineWidth = 3;
                    for (let k = 0; k < 8; k++) {
                        const ang = (k / 8) * Math.PI * 2 + frames * 0.05;
                        ctx.beginPath();
                        ctx.moveTo(o.x + o.w / 2, o.y + o.h / 2);
                        ctx.lineTo(o.x + o.w / 2 + Math.cos(ang) * o.w / 1.5, o.y + o.h / 2 + Math.sin(ang) * o.h / 1.5);
                        ctx.stroke();
                    }
                    ctx.shadowBlur = 0;
                } else if (o.type === 'crystals') {
                    ctx.fillStyle = '#d946ef';
                    ctx.beginPath();
                    ctx.moveTo(o.x + o.w / 2, o.y);
                    ctx.lineTo(o.x + o.w, o.y + o.h / 2);
                    ctx.lineTo(o.x + o.w / 2, o.y + o.h);
                    ctx.lineTo(o.x, o.y + o.h / 2);
                    ctx.fill();
                    // Reflection
                    ctx.fillStyle = '#f0abfc';
                    ctx.beginPath();
                    ctx.moveTo(o.x + o.w / 2, o.y);
                    ctx.lineTo(o.x + o.w / 2 + 5, o.y + o.h / 2);
                    ctx.lineTo(o.x + o.w / 2, o.y + o.h);
                    ctx.fill();
                } else {
                    // Default Jagged Asteroid
                    drawJaggedAsteroid(ctx, o);
                }

                // Collision
                const hitMargin = 10;
                if (
                    ship.x < o.x + o.w - hitMargin &&
                    ship.x + ship.w > o.x + hitMargin &&
                    ship.y < o.y + o.h - hitMargin &&
                    ship.y + ship.h > o.y + hitMargin
                ) {
                    createExplosion(ship.x, ship.y, '#f87171');
                    isRunning = false;
                    onLose();
                    return;
                }

                if (o.x + o.w < -50) obstacles.splice(i, 1);
            });

            if (isRunning) frameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            isRunning = false;
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
            canvas.removeEventListener('touchstart', handleTouch);
            canvas.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div className="relative w-full h-full cursor-none">
            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* In-Game UI */}
            <div className="absolute top-4 left-0 right-0 px-8 flex justify-between items-start pointer-events-none">
                {/* Fuel Bar */}
                <div className="flex flex-col gap-1 w-64">
                    <div className="flex justify-between items-baseline text-xs font-bold font-mono tracking-widest text-yellow-400">
                        <span>FUEL STATUS</span>
                        <span className={fuel < 20 ? 'animate-pulse text-red-500' : ''}>{Math.round(fuel)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden relative">
                        {/* Critical segments */}
                        <div className="absolute inset-0 flex">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex-1 border-r border-black/20"></div>
                            ))}
                        </div>
                        <div
                            className={`h-full transition-all duration-200 ease-out ${fuel < 20 ? 'bg-red-500' : 'bg-gradient-to-r from-yellow-600 to-yellow-400'}`}
                            style={{ width: `${fuel}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono text-center">COLLECT ENERGY CELLS TO SURVIVE</div>
                </div>

                {/* Progress / Time */}
                <div className="flex flex-col items-end gap-1">
                    <div className="text-white font-bold font-mono text-lg drop-shadow-md">
                        {config.name}
                    </div>
                    <div className="text-sm font-mono text-cyan-400">
                        T-{timeLeft.toFixed(1)}s
                    </div>
                </div>
            </div>

            <button
                onClick={onBack}
                className="absolute bottom-6 left-6 text-white/40 hover:text-white bg-black/20 hover:bg-red-900/40 px-4 py-2 rounded-full text-xs transition-colors border border-transparent hover:border-red-500/50"
            >
                ABORT MISSION
            </button>
        </div>
    );
}

function WinScreen({ levelIdx, onBack, isCurrentDay }) {
    const config = LEVEL_CONFIGS[(levelIdx - 1) % LEVEL_CONFIGS.length];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-pulse-slow">
            <div className="text-8xl filter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">🏆</div>
            <div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-2">
                    SECTOR CLEARED
                </h2>
                <div className="text-xl text-indigo-100 mb-4">
                    Successfully navigated <span style={{ color: config.color }} className="font-bold">{config.name}</span>
                </div>
                {isCurrentDay && (
                    <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-indigo-500/30">
                        <p className="text-indigo-200 text-sm">Vital sleep data secured for the Federation.</p>
                    </div>
                )}
            </div>

            <button
                onClick={onBack}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl shadow-[0_0_25px_rgba(234,179,8,0.5)] transform transition hover:scale-105"
            >
                CONTINUE VOYAGE
            </button>
        </div>
    );
}

function LoseScreen({ onRetry, onBack, attemptsLeft }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 bg-red-900/10 relative overflow-hidden">
            {/* Background red pulse */}
            <div className="absolute inset-0 bg-red-500/5 animate-pulse z-0 pointer-events-none"></div>

            <div className="text-8xl animate-bounce z-10">💥</div>
            <div className="z-10">
                <h2 className="text-5xl font-black text-red-500 tracking-tighter mb-2">MISSION FAILED</h2>
                <p className="text-red-200 text-lg">Hull integrity compromised.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 z-10 mt-4">
                {attemptsLeft > 0 ? (
                    <button
                        onClick={onRetry}
                        className="px-8 py-3 bg-white text-red-900 font-bold rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:scale-105"
                    >
                        RETRY SECTOR ({attemptsLeft} attempts left)
                    </button>
                ) : (
                    <div className="px-8 py-3 bg-gray-800 text-gray-400 font-bold rounded-xl border border-gray-700 cursor-not-allowed">
                        DRYDOCK (0 Attempts)
                    </div>
                )}

                <button
                    onClick={onBack}
                    className="px-8 py-3 border-2 border-red-500/50 text-red-300 font-bold rounded-xl hover:bg-red-900/40 transition-all"
                >
                    RETURN TO MAP
                </button>
            </div>
        </div>
    );
}

function LockedScreen({ onClose }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-md text-center p-8 z-50">
            <div className="text-6xl mb-6">🛑</div>
            <h2 className="text-3xl font-bold text-white mb-3">FLIGHT PERMIT EXPIRED</h2>
            <p className="text-gray-400 mb-8 max-w-md">
                Daily flight allowance reached.
                <br />
                Pilots must rest to ensure peak cognitive performance.
                <br /><br />
                <span className="text-indigo-400">Next launch window: Tomorrow.</span>
            </p>
            <button
                onClick={onClose}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
                Return to Dashboard
            </button>
        </div>
    );
}