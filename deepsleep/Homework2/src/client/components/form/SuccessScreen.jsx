import GlassCard from '../ui/GlassCard';
import SpaceLayout from '../ui/SpaceLayout';

export default function SuccessScreen({
    submissionCount,
    saveStatus,
    saveError,
    onShowGame,
    onLogout
}) {
    return (
        <SpaceLayout>
            {/* Success Glass Card */}
            <GlassCard className="w-full max-w-lg text-center" animateFloat={true} glowColor="indigo">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                        <span className="text-4xl">✅</span>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-2">כל הכבוד!</h2>

                {saveStatus === 'saving' && <p className="text-yellow-400 animate-pulse">⏳ שומר נתונים...</p>}
                {saveStatus === 'success' && <p className="text-green-400">היומן היומי נשמר בהצלחה! כל הכבוד!</p>}
                {saveStatus === 'error' && (
                    <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl mb-4">
                        <p className="text-red-300 font-bold">❌ שגיאה בשמירה:</p>
                        <p className="text-red-200 text-sm font-mono">{saveError}</p>
                    </div>
                )}


                <p className="text-[var(--text-secondary)] mb-8">היומן היומי הושלם.</p>

                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[var(--glass-bg-accent)] border border-[var(--glass-border)] mb-6">
                        <p className="text-sm text-[var(--text-secondary)] mb-2">התקדמות המשימה שלך</p>
                        <div className="flex justify-between items-end mb-1">
                            <span className="font-mono font-bold text-cyan-400">DAY {submissionCount} / 14</span>
                            <span className="text-xs text-[var(--text-secondary)]">{Math.round((submissionCount / 14) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-indigo-950 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-cyan-500 shadow-[0_0_10px_#00f3ff]"
                                style={{ width: `${Math.min(100, (submissionCount / 14) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={onShowGame}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-transform animate-pulse"
                    >
                        🚀 שחק במשחק החלל (שלב {submissionCount})
                    </button>



                    <button onClick={onLogout} className="w-full py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors">
                        התנתק וחזור להתחלה
                    </button>
                </div>
            </GlassCard>
        </SpaceLayout >
    );
}
