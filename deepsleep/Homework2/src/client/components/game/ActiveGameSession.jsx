import { useEffect, useRef, useState } from 'react';
import { LEVEL_CONFIGS } from "../../data/levelConfigs";

export default function ActiveGameSession({ levelIdx, onWin, onLose, onBack }) {
    const canvasRef = useRef(null);
    const config = LEVEL_CONFIGS[(levelIdx - 1) % LEVEL_CONFIGS.length];

    const [timeLeft, setTimeLeft] = useState(config.duration);
    const [progress, setProgress] = useState(0);
    const [fuel, setFuel] = useState(100); // 0-100

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // High DPI Scaling
        const dpr = window.devicePixelRatio || 1;

        // Init Check
        const logicalWidth = canvas.parentElement.clientWidth;
        const logicalHeight = canvas.parentElement.clientHeight;

        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        let frameId;
        let frames = 0;
        let startTime = Date.now();
        let isRunning = true;

        // Game Parameters
        const duration = config.duration;

        // Difficulty Logic:
        // We use the config.difficulty (1 - 3.5) but we scale it slightly by day count 
        // effectively prevents it from becoming "too easy" if we loop back to a simpler biome,
        // BUT we clamp it so it never becomes impossible.
        const dayFactor = Math.min(2.0, (levelIdx - 1) * 0.1); // Slowly adds up to +2.0 difficulty over 20 days
        const finalDifficulty = Math.min(5.5, config.difficulty + dayFactor); // CAP difficulty at 5.5

        // Speed: Cap at 10.0 (Reasonable fast pace, not sonic speed)
        const speed = Math.min(10.0, 4.5 + (finalDifficulty * 1.8));

        // Spawn Rate: Cap at 20 frames (Fast but not a solid wall)
        // Note: Lower number = Faster spawn
        const spawnRate = Math.max(20, 60 - (finalDifficulty * 8));

        // Fuel Params
        // Drains max 15% per second
        const fuelDrain = Math.min(0.15, 0.05 + (finalDifficulty * 0.02));
        const fuelSpawnRate = 180; // ~3 seconds

        // Objects
        // Use LOGICAL height for ship position
        const ship = { x: 50, y: logicalHeight / 2, w: 40, h: 24, dy: 0 };
        const obstacles = [];
        const collectibles = [];
        const particles = [];

        // Background Stars
        // Use LOGICAL dimensions for stars
        const stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * logicalWidth,
            y: Math.random() * logicalHeight,
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
            if (y < myY + logicalHeight / 2) { keys.ArrowUp = true; keys.ArrowDown = false; }
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
            if (canvas.width !== Math.round(canvas.parentElement.clientWidth * dpr)) {
                canvas.width = canvas.parentElement.clientWidth * dpr;
                canvas.height = canvas.parentElement.clientHeight * dpr;
                ctx.scale(dpr, dpr);
            }

            // Derive logical width from physical width and current scale
            // (Note: canvas.width updates in resize block above, so this is safe)
            const currentLogicalWidth = canvas.width / dpr;
            const currentLogicalHeight = canvas.height / dpr;

            // --- Draw ---
            // Clear LOGICAL Width/Height area
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, currentLogicalWidth, currentLogicalHeight);

            // Stars
            ctx.fillStyle = 'white';
            stars.forEach(s => {
                s.x -= s.speed * (speed * 0.1);
                if (s.x < 0) s.x = currentLogicalWidth; // Loop within logical width
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
            // Use LOGICAL Height for clamping
            if (ship.y + ship.h > currentLogicalHeight) ship.y = currentLogicalHeight - ship.h;

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
                    x: currentLogicalWidth, // Spawn at right edge (Logical)
                    y: Math.random() * (currentLogicalHeight - 40),
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
                    x: currentLogicalWidth, // Spawn at right edge (Logical)
                    y: Math.random() * (currentLogicalHeight - 50),
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
