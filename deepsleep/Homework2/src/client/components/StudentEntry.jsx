import React, { useState, useEffect } from "react";
import SpaceLayout from "./ui/SpaceLayout";
import GlassCard from "./ui/GlassCard";
import { getOrCreateAnonymousStudent } from "../../server/services/studentService";

export default function StudentEntry({ onLogin }) {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [params, setParams] = useState({ expId: null, classId: null });

    // Consent State
    const [showConsent, setShowConsent] = useState(true);

    useEffect(() => {
        // Parse URL parameters
        const searchParams = new URLSearchParams(window.location.search);
        const expId = searchParams.get("experimentId") || searchParams.get("exp");
        const classId = searchParams.get("classId") || searchParams.get("class");

        if (expId && classId) {
            setParams({ expId, classId });
        } else {
            setError("קישור לא תקין: חסרים פרטי ניסוי או כיתה.");
        }
    }, []);

    const handleStart = async (e) => {
        e.preventDefault();
        if (!code || code.length < 3) {
            setError("אנא הכנס לפחות 3 ספרות.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const user = await getOrCreateAnonymousStudent(params.expId, params.classId, code);
            // Save to session so SleepForm can read it
            sessionStorage.setItem("currentUser", JSON.stringify(user));
            // Success! Login the user
            onLogin(user);
        } catch (err) {
            console.error(err);
            setError("אירעה שגיאה בכניסה. נסה שנית.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SpaceLayout>
            {/* Consent Modal Overlay */}
            {showConsent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" glowColor="indigo">
                        <div className="p-2 text-right dir-rtl">
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-indigo-500/30 pb-2">
                                🌙 יומן שינה - טופס הסכמה
                            </h2>

                            <div className="text-indigo-100 space-y-4 text-sm leading-relaxed overflow-y-auto max-h-[50vh] pl-2 custom-scrollbar">
                                <p className="font-bold text-lg text-cyan-300">
                                    "שינה – שליש מהחיים"
                                </p>
                                <p>
                                    לשינויים בדפוסי השינה ישנן השלכות על הבריאות והתפקוד היומיומי של כולנו.
                                    פרויקט "שינה – שליש מהחיים" הוא פרויקט מדע אזרחי שמטרתו לחקור את נוף השינה של האזרחים בחברה המודרנית בישראל ולייצר תובנות בתהליכים הביולוגיים והחברתיים המשפיעים על הרגלי השינה.
                                    בכך, אנו שואפים לסייע בפיתוח התערבויות יעילות לשיפור איכות השינה בקרב בני הנוער בישראל.
                                </p>
                                <p>
                                    המחקר מתואם במרכז לקידום מדע אזרחי בבית הספר (המשותף לטכניון ולאוניברסיטת חיפה) ונחקר ע"י <strong>פרופ' תמר שוחט</strong> מהחוג לסיעוד, מומחית בחקר השינה, ו<strong>פרופ' ערן טאובר</strong>, מומחה לשעונים ביולוגיים, מהחוג לביולוגיה אבולוציונית וסביבתית באוניברסיטת חיפה.
                                </p>
                                <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-500/20">
                                    <ul className="list-disc list-inside space-y-1 text-indigo-200">
                                        <li>מילוי השאלון הינו למשך שבועיים.</li>
                                        <li>ההשתתפות היא וולונטרית וניתן לפרוש ממנה בכל עת.</li>
                                        <li>המילוי אינו מהווה סכנה או איום לשלומך בשום אופן.</li>
                                        <li>מענה על השאלון מהווה הסכמה להשתתף במחקר.</li>
                                    </ul>
                                </div>
                                <p className="text-xs text-indigo-400 mt-4">
                                    לשאלות נוספות ניתן לפנות לנעם.
                                </p>
                            </div>

                            <div className="mt-8 flex justify-center sticky bottom-0 bg-transparent pt-4">
                                <button
                                    onClick={() => setShowConsent(false)}
                                    className="w-full sm:w-auto px-12 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                >
                                    <span>קראתי ואני מסכים/ה ✅</span>
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            <div className="w-full max-w-md mt-12 text-center px-4">
                <h1 className="text-3xl font-bold text-[color:var(--text-main)] mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    ברוכים הבאים!
                </h1>
                <p className="text-indigo-200 mb-8 tracking-wider font-mono text-xs uppercase opacity-80">
                    CLASS ENTRY PROTOCOL
                </p>

                <GlassCard className="p-8" glowColor="cyan">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {!params.expId ? (
                        <p className="text-indigo-300">אנא המתן לטעינת נתונים...</p>
                    ) : (
                        <form onSubmit={handleStart} className="space-y-6">
                            <div className="space-y-2 text-right">
                                <label className="text-sm text-indigo-300 font-bold block">
                                    הכנס את 4 הספרות האחרונות של הנייד:
                                </label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={code}
                                    onChange={(e) => {
                                        // Allow only numbers
                                        const val = e.target.value.replace(/\D/g, "");
                                        setCode(val);
                                    }}
                                    className="w-full bg-indigo-950/50 border border-indigo-500/30 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-indigo-500/50"
                                    placeholder="0000"

                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || code.length < 3}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] transition-all relative overflow-hidden"
                            >
                                {loading ? (
                                    <span className="animate-pulse">מתחבר...</span>
                                ) : (
                                    "כניסה למערכת 🚀"
                                )}
                            </button>
                        </form>
                    )}
                </GlassCard>

                <div className="mt-8 text-xs text-indigo-400/50 font-mono">
                    SECURE CONNECTION ESTABLISHED
                </div>
            </div>
        </SpaceLayout>
    );
}
