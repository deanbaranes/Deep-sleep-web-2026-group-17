import { useState, useEffect } from "react";
import { fetchAllSleepEntries } from "../../server/services/sleepEntriesService";
import { fetchAllGlobalActiveQuestions } from "../../server/services/classCustomizationService";
import { generateResearchReportExcel } from "../utils/excelGenerator";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function ResearchReportsView({ onBack }) {
    const [entries, setEntries] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [anonymousMap, setAnonymousMap] = useState({});

    // Categories definition matching Dashboard
    const CATEGORIES = [
        { id: "focus", label: "ריכוז" },
        { id: "nutrition", label: "תזונה" },
        { id: "mental", label: "חוויה נפשית" },
        { id: "environment", label: "הפרעות סביבתיות" },
        { id: "exercise", label: "פעילות גופנית" },
        { id: "general", label: "אחר" }
    ];

    useEffect(() => {
        async function loadData() {
            try {
                const [loadedEntries, loadedQuestions] = await Promise.all([
                    fetchAllSleepEntries(),
                    fetchAllGlobalActiveQuestions()
                ]);

                // Generate Anonymized Map
                // 1. Extract all unique students with their class info
                const uniqueStudents = new Map();
                loadedEntries.forEach(e => {
                    const key = `${e.classId}_${e.studentId}`;
                    if (!uniqueStudents.has(key)) {
                        uniqueStudents.set(key, {
                            studentId: e.studentId,
                            classId: e.classId || "",
                            sortKey: `${e.classId || "Z"}_${e.studentId}` // Sort by Class then ID
                        });
                    }
                });

                // 2. Sort deterministically
                const sortedStudents = Array.from(uniqueStudents.values()).sort((a, b) =>
                    a.sortKey.localeCompare(b.sortKey)
                );

                // 3. Create ID Map (studentId -> Sequential Number)
                const newIdMap = {};
                sortedStudents.forEach((s, index) => {
                    newIdMap[`${s.classId}_${s.studentId}`] = index + 1;
                });

                setAnonymousMap(newIdMap);
                setEntries(loadedEntries);
                setQuestions(loadedQuestions);
            } catch (err) {
                console.error("Failed to load report data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleExport = (category) => {
        setExporting(true);
        try {
            const count = generateResearchReportExcel(entries, questions, category, anonymousMap);
            alert(`הדוח נוצר בהצלחה! (נמצאו ${count} שורות רלוונטיות)`);
        } catch (err) {
            console.error("Export failed", err);
            alert(err.message || "שגיאה ביצירת הדוח");
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <SpaceLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-cyan-400 text-xl font-bold animate-pulse">טוען נתונים לדוחות...</p>
                </div>
            </SpaceLayout>
        );
    }

    return (
        <SpaceLayout>
            <GlassCard className="w-full max-w-4xl mx-auto mt-12" animateFloat={true} glowColor="indigo">
                <div className="flex justify-between items-center mb-8 border-b border-indigo-500/30 pb-4">
                    <h1 className="text-3xl font-extrabold text-white">הפקת דוחות מחקר</h1>
                    <button
                        onClick={onBack}
                        className="rounded-xl border border-indigo-500/50 px-6 py-2 text-indigo-300 font-semibold hover:text-white hover:bg-white/5 transition-colors"
                    >
                        חזרה לתפריט
                    </button>
                </div>

                <p className="text-indigo-200 mb-8 text-center text-lg">
                    בחר קטגוריה להפקת דוח אקסל מרוכז עבור כלל התשובות בכל הכיתות.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map(cat => {
                        // Count questions in this category for UI info
                        const count = questions.filter(q => q.category === cat.id).length;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleExport(cat)}
                                disabled={exporting || count === 0}
                                className={`
                  group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
                  ${count > 0
                                        ? "bg-indigo-950/40 border-indigo-500/30 hover:border-cyan-400 hover:bg-indigo-900/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                                        : "bg-gray-900/20 border-gray-700/30 opacity-50 cursor-not-allowed"}
                `}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <span className="text-4xl filter drop-shadow-lg">
                                        {cat.id === "focus" && "🎯"}
                                        {cat.id === "nutrition" && "🍎"}
                                        {cat.id === "mental" && "🧠"}
                                        {cat.id === "environment" && "🔊"}
                                        {cat.id === "exercise" && "🏃"}
                                        {cat.id === "general" && "📝"}
                                    </span>
                                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                                        {cat.label}
                                    </h3>
                                    <span className="text-xs bg-black/30 px-3 py-1 rounded-full text-indigo-300">
                                        {count} שאלות פעילות
                                    </span>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-purple-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 text-center text-xs text-indigo-400">
                    * הדוחות כוללים נתונים מכלל בתי הספר והכיתות המשתתפים בניסוי.
                </div>
            </GlassCard>
        </SpaceLayout>
    );
}
