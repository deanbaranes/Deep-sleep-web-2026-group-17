export default function LoseScreen({ onRetry, onBack, attemptsLeft }) {
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
