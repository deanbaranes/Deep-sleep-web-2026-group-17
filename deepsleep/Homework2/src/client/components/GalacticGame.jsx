import { useEffect, useRef, useState } from 'react';

export default function GalacticGame({ dayCount, onClose }) {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('start'); // start, playing, gameover, locked
    const [score, setScore] = useState(0);

    // ניהול ניסיונות - שמירה בלוקל סטורג' כדי שזה יישמר גם אם מרעננים
    const STORAGE_KEY = `galactic_attempts_day_${dayCount}`;
    const MAX_ATTEMPTS = 3;

    const [attempts, setAttempts] = useState(() => {
        // קריאה ראשונית מהזיכרון
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 0;
    });

    // פונקציה שמתחילה משחק (או ניסיון חוזר) וסופרת ניסיון
    const handleStartGame = () => {
        if (attempts >= MAX_ATTEMPTS) {
            setGameState('locked');
            return;
        }

        // העלאת מונה הניסיונות ושמירה מיידית
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem(STORAGE_KEY, newAttempts.toString());

        setScore(0);
        setGameState('playing');
    };

    // בדיקה ראשונית - אם המשתמש נכנס וכבר גמר את הניסיונות
    useEffect(() => {
        if (attempts >= MAX_ATTEMPTS && gameState === 'start') {
            setGameState('locked');
        }
    }, [attempts, gameState]);

    // Difficulty scaling based on Day Count
    const baseSpeed = 4 + (dayCount * 0.5);
    const spawnRate = Math.max(20, 60 - (dayCount * 2));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || gameState !== 'playing') return;

        // Set initial size
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = Math.min(400, window.innerHeight * 0.6);

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let frames = 0;

        // Game Objects
        const ship = { x: 50, y: 150, width: 30, height: 20, dy: 0 };
        let obstacles = [];
        let stars = [];

        // Keys
        const keys = { ArrowUp: false, ArrowDown: false };

        const handleKeyDown = (e) => (keys[e.code] = true);
        const handleKeyUp = (e) => (keys[e.code] = false);

        const handleTouchStart = (e) => {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            const middle = window.innerHeight / 2;
            if (touchY < middle) {
                keys.ArrowUp = true;
                keys.ArrowDown = false;
            } else {
                keys.ArrowDown = true;
                keys.ArrowUp = false;
            }
        };

        const handleTouchEnd = () => {
            keys.ArrowUp = false;
            keys.ArrowDown = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);

        // Init Stars
        for (let i = 0; i < 50; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 3 + 1
            });
        }

        const gameLoop = () => {
            frames++;

            // Update dimensions dynamically if resized
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = Math.min(400, window.innerHeight * 0.6);

            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // --- Background Stars ---
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                star.x -= star.speed;
                if (star.x < 0) star.x = canvas.width;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // --- Ship Movement ---
            if (keys.ArrowUp) ship.dy = -5;
            else if (keys.ArrowDown) ship.dy = 5;
            else ship.dy *= 0.9; // Friction

            ship.y += ship.dy;
            if (ship.y < 0) ship.y = 0;
            if (ship.y + ship.height > canvas.height) ship.y = canvas.height - ship.height;

            // Draw Ship
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath();
            ctx.moveTo(ship.x + ship.width, ship.y + ship.height / 2);
            ctx.lineTo(ship.x, ship.y);
            ctx.lineTo(ship.x, ship.y + ship.height);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // --- Obstacles ---
            if (frames % Math.floor(spawnRate) === 0) {
                obstacles.push({
                    x: canvas.width,
                    y: Math.random() * (canvas.height - 30),
                    width: 30 + Math.random() * 20,
                    height: 30 + Math.random() * 20,
                    speed: baseSpeed + Math.random() * 2
                });
            }

            ctx.fillStyle = '#6366f1';
            obstacles.forEach((obs, index) => {
                obs.x -= obs.speed;

                // Collision Detection
                if (
                    ship.x < obs.x + obs.width &&
                    ship.x + ship.width > obs.x &&
                    ship.y < obs.y + obs.height &&
                    ship.y + ship.height > obs.y
                ) {
                    setGameState('gameover');
                }

                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

                if (obs.x + obs.width < 0) {
                    obstacles.splice(index, 1);
                    setScore(s => s + 10);
                }
            });

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (canvas) {
                canvas.removeEventListener('touchstart', handleTouchStart);
                canvas.removeEventListener('touchmove', handleTouchStart);
                canvas.removeEventListener('touchend', handleTouchEnd);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, dayCount, baseSpeed, spawnRate]);

    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] bg-black">
            <canvas ref={canvasRef} className="block w-full h-[300px] sm:h-[400px]" />

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 text-white font-mono text-xl z-10 drop-shadow-md flex gap-4">
                <span>SCORE: {score}</span>
                <span className={`${attempts >= MAX_ATTEMPTS ? 'text-red-400' : 'text-cyan-400'}`}>
                    ATTEMPTS: {attempts}/{MAX_ATTEMPTS}
                </span>
            </div>

            {/* Start Screen */}
            {gameState === 'start' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-4 animate-pulse">
                        GALACTIC DRIFT
                    </h2>
                    <div className="text-indigo-200 mb-8 text-center px-4">
                        <p className="text-sm font-mono text-cyan-300 tracking-widest mb-2">MISSION DAY: {dayCount}/14</p>
                        <p className="text-xs text-red-300 font-bold bg-red-900/30 p-2 rounded border border-red-500/50">
                            שים לב: יש לך {MAX_ATTEMPTS} ניסיונות בלבד להיום!<br />
                            כל התחלת משחק נחשבת ניסיון (גם אם יוצאים באמצע).
                        </p>
                    </div>

                    {attempts < MAX_ATTEMPTS ? (
                        <button
                            onClick={handleStartGame}
                            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-[0_0_15px_#00f3ff] transition-all transform hover:scale-105"
                        >
                            START MISSION ({MAX_ATTEMPTS - attempts} LEFT)
                        </button>
                    ) : (
                        <div className="text-red-400 font-bold border border-red-500 p-3 rounded-xl bg-red-900/20">
                            🔒 אין ניסיונות נוספים להיום
                        </div>
                    )}
                </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm z-20">
                    <h2 className="text-4xl font-bold text-white mb-2">MISSION FAILED</h2>
                    <p className="text-xl text-red-200 mb-6">Final Score: {score}</p>

                    <div className="flex gap-4 items-center">
                        {attempts < MAX_ATTEMPTS ? (
                            <button
                                onClick={handleStartGame}
                                className="px-6 py-2 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                RETRY ({MAX_ATTEMPTS - attempts} LEFT)
                            </button>
                        ) : (
                            <span className="text-white font-mono bg-black/50 px-4 py-2 rounded">
                                🚫 NO RETRIES LEFT
                            </span>
                        )}

                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-white text-white font-bold rounded-lg hover:bg-white/10"
                        >
                            EXIT
                        </button>
                    </div>
                </div>
            )}

            {/* Locked Screen (אם נגמרו הניסיונות) */}
            {gameState === 'locked' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-md z-20 text-center p-6">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-white mb-2">המערכת נעולה</h2>
                    <p className="text-gray-300 mb-6">
                        ניצלת את כל {MAX_ATTEMPTS} הניסיונות שלך להיום.<br />
                        הציון האחרון נשמר. נתראה מחר!
                    </p>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                        חזור לדשבורד
                    </button>
                </div>
            )}
        </div>
    );
}