
export default function QuestionInput({ current, answers, setAnswers, setStep, step, toggleMultiSelect }) {

    // Helper to safely get value for controlled components
    const getValue = (key) => {
        return answers[key] || "";
    };

    return (
        <div className="min-h-[120px] mb-8">

            {/* Choice / Multi Buttons */}
            {(current.type === "select" || current.type === "multi") && (
                <div className="grid grid-cols-1 gap-3">
                    {current.options.map((opt) => {
                        const isSelected = current.type === "multi"
                            ? (answers[current.key] || []).includes(opt.value)
                            : answers[current.key] === opt.value;

                        return (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    if (current.type === "multi") toggleMultiSelect(opt.value);
                                    else {
                                        setAnswers({ ...answers, [current.key]: opt.value });
                                        // Auto-advance with slight delay for visual feedback
                                        setTimeout(() => setStep(step + 1), 200);
                                    }
                                }}
                                className={`
                      relative overflow-hidden rounded-xl py-4 px-6 font-medium text-right transition-all duration-300 border
                      ${isSelected
                                        ? "bg-indigo-600/90 border-cyan-400 text-white neon-border shadow-[0_0_15px_rgba(0,243,255,0.4)] translate-x-1"
                                        : "bg-[var(--glass-bg-accent)] border-[var(--glass-border)] text-[var(--text-main)] hover:bg-[var(--glass-bg)] hover:border-indigo-400 hover:scale-[1.02]"
                                    }
                    `}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <span>{opt.label}</span>
                                    {current.type === "multi" && (
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-indigo-400/50'}`}>
                                            {isSelected && <span className="text-xs">✓</span>}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Text Area */}
            {current.type === "text" && (
                <textarea
                    placeholder={current.placeholder}
                    value={getValue(current.key)}
                    onChange={(e) => setAnswers({ ...answers, [current.key]: e.target.value })}
                    className="w-full h-32 bg-[var(--input-bg)] text-[var(--text-main)] placeholder-[var(--text-secondary)] border border-[var(--input-border)] rounded-xl p-4 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none resize-none transition-all"
                />
            )}

        </div>
    );
}
