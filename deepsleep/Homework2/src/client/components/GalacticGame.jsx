import { useEffect, useState } from 'react';

// --- Imported Sub-Components ---
import MapLevelSelect from './game/MapLevelSelect';
import ActiveGameSession from './game/ActiveGameSession';
import WinScreen from './game/WinScreen';
import LoseScreen from './game/LoseScreen';
import LockedScreen from './game/LockedScreen';

export default function GalacticGame({ dayCount, onClose, userId }) {
    // --- State ---
    const [view, setView] = useState('map'); // 'map', 'game', 'win', 'lose', 'locked'
    const [currentLevel, setCurrentLevel] = useState(dayCount);

    const [attempts, setAttempts] = useState(() => {
        const key = `galactic_voyage_attempts_${userId || 'guest'}_day_${dayCount}`;
        const saved = localStorage.getItem(key);
        return saved ? parseInt(saved, 10) : 0;
    });

    const MAX_ATTEMPTS = 3;

    // Save attempts
    useEffect(() => {
        const key = `galactic_voyage_attempts_${userId || 'guest'}_day_${dayCount}`;
        localStorage.setItem(key, attempts.toString());
    }, [attempts, dayCount, userId]);


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