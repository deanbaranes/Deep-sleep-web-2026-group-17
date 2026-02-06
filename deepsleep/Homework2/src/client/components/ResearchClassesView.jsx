import { useState, useEffect } from "react";
import { fetchResearchClasses, createResearchClass } from "../../server/services/researchManagerService";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';
import ResearchDashboardHeader from "./ResearchDashboardHeader";

export default function ResearchClassesView({ experimentId, setExperimentId, onBack }) {
    const [classesList, setClassesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [newSchoolName, setNewSchoolName] = useState("");
    const [newGrade, setNewGrade] = useState("");
    const [newClassNum, setNewClassNum] = useState("");

    const canSubmitCreateClass = newSchoolName.trim() && newGrade && newClassNum;

    useEffect(() => {
        fetchClasses();
    }, [experimentId]);

    async function fetchClasses() {
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const list = await fetchResearchClasses(experimentId);
            setClassesList(list);
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת כיתות. וודא שה ID של הניסוי נכון.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateClass() {
        if (!canSubmitCreateClass) return;
        setLoading(true);
        try {
            const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');
            const safeSchool = sanitize(newSchoolName);
            const safeGrade = sanitize(newGrade);
            const safeClassNum = sanitize(newClassNum);
            const newClassId = `${safeSchool}_${safeGrade}_${safeClassNum}`;

            await createResearchClass(experimentId, newClassId, {
                schoolName: newSchoolName,
                grade: newGrade,
                classNum: newClassNum
            });

            setMessage(`כיתה ${newClassId} נוצרה בהצלחה!`);
            setNewSchoolName(""); setNewGrade(""); setNewClassNum("");
            fetchClasses(); // Refresh list
        } catch (err) {
            console.error(err);
            setError("שגיאה ביצירת כיתה");
        } finally {
            setLoading(false);
        }
    }

    const handleCopyLink = (cls) => {
        const origin = window.location.origin;
        const url = `${origin}/?experimentId=${experimentId}&classId=${cls.id}`;

        const fallbackCopy = (text) => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed"; // Avoid scrolling to bottom
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    alert(`הקישור לכיתה הועתק בהצלחה!\n${text}`);
                } else {
                    prompt("העתק את הקישור ידנית:", text);
                }
            } catch (err) {
                console.error("Fallback copy failed", err);
                prompt("העתק את הקישור ידנית:", text);
            }
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                alert(`הקישור לכיתה הועתק בהצלחה!\n${url}`);
            }).catch(err => {
                console.error("Async copy failed", err);
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
    };

    return (
        <SpaceLayout>
            <GlassCard className="w-full max-w-4xl" animateFloat={true} glowColor="cyan">
                <ResearchDashboardHeader
                    title="ניהול כיתות וקישורים"
                    experimentId={experimentId}
                    setExperimentId={setExperimentId}
                    error={error}
                    message={message}
                />

                <div className="flex justify-between items-center mb-6">
                    <p className="text-indigo-200">רשימת הכיתות בניסוי: <b>{experimentId}</b></p>
                    <button onClick={fetchClasses} className="text-cyan-400 hover:underline text-sm">רענן רשימה</button>
                </div>

                {/* Create Class Form */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
                    <h3 className="text-[color:var(--text-main)] font-bold mb-3 flex items-center gap-2">➕ הוספת כיתה חדשה</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            placeholder="שם בית ספר"
                            value={newSchoolName}
                            onChange={e => setNewSchoolName(e.target.value)}
                            className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                        />
                        <select
                            value={newGrade}
                            onChange={e => setNewGrade(e.target.value)}
                            className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                        >
                            <option value="" disabled>שכבה</option>
                            {["ז", "ח", "ט", "י", "יא", "יב", "יג", "יד"].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select
                            value={newClassNum}
                            onChange={e => setNewClassNum(e.target.value)}
                            className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                        >
                            <option value="" disabled>מס'</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <button
                            onClick={handleCreateClass}
                            disabled={!canSubmitCreateClass || loading}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg py-2 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "יוצר..." : "צור כיתה"}
                        </button>
                    </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading && <p className="text-[color:var(--text-main)] text-center">טוען...</p>}
                    {!loading && classesList.length === 0 && <p className="text-indigo-400 text-center py-8">לא נמצאו כיתות בניסוי זה.</p>}

                    {classesList.map(cls => (
                        <div key={cls.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-white/10 transition-colors">
                            <div className="text-right">
                                <div className="font-bold text-[color:var(--text-main)] text-lg">{cls.id}</div>
                                <div className="text-sm text-indigo-300">
                                    {cls.schoolName ? `${cls.schoolName} - ${cls.grade}'${cls.classNum}` : '(פרטים חסרים)'}
                                </div>
                            </div>

                            <button
                                onClick={() => handleCopyLink(cls)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-bold hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                            >
                                <span>🔗 העתק קישור לכיתה</span>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-indigo-500/30">
                    <button onClick={onBack} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">
                        חזרה לתפריט
                    </button>
                </div>
            </GlassCard>
        </SpaceLayout>
    );
}
