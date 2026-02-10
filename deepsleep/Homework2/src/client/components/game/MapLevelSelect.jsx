import { LEVEL_CONFIGS } from "../../data/levelConfigs";

export default function MapLevelSelect({ currentDay, onSelectLevel, isLocked }) {
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
