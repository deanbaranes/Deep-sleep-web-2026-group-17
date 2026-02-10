import { LEVEL_CONFIGS } from "../../data/levelConfigs";

export default function WinScreen({ levelIdx, onBack, isCurrentDay }) {
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
