import { useState, useEffect, useMemo } from "react";
import { saveSleepEntry, getUserSubmissionCount } from "../../server/services/sleepEntriesService";
import { fetchActiveQuestions } from "../../server/services/classCustomizationService";
import GalacticGame from "./GalacticGame";
import StudentWelcomeScreen from "./StudentWelcomeScreen";

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

import { STATIC_STEPS } from "../data/staticQuestions";

import { useAppContext } from "../context/AppContext";

// --- Sub-components ---
import SuccessScreen from "./form/SuccessScreen";
import QuestionInput from "./form/QuestionInput";

/**
 * SleepForm Component
 * -------------------
 * The primary data collection wizard for students.
 * Responsibilities:
 * 1. Displaying a multi-step form wizard (Static steps + Dynamic questions).
 * 2. Merging static questions with research-manager defined dynamic questions.
 * 3. Saving daily sleep entries to Firestore via `sleepEntriesService`.
 * 4. Handling validation and UI state for the form progression.
 */
export default function SleepForm() {
  const { user, logout } = useAppContext();
  // "welcome" | "form" | "success" (handled by step logic mostly)
  const [view, setView] = useState("welcome");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({}); // Dynamic answers map
  const [dynamicQuestions, setDynamicQuestions] = useState([]);

  // Merge Static steps with Dynamic questions (except Notes, which should be last)
  const steps = useMemo(() => {
    // We want Notes to be last. Find index of notes.
    const notesIndex = STATIC_STEPS.findIndex(s => s.key === "notes");
    const beforeNotes = STATIC_STEPS.slice(0, notesIndex);
    const notesStep = STATIC_STEPS[notesIndex];

    // Remap dynamic questions to Step format
    const mappedDynamic = dynamicQuestions.map(q => ({
      key: `custom_${q.id}`,
      title: q.text,
      type: q.type || "text",
      options: (q.type === "select" || q.type === "multi")
        ? (q.options || []).map(opt => ({ value: opt, label: opt }))
        : [],
      placeholder: q.type === "text" ? "כתוב את תשובתך כאן..." : undefined,
      isCustom: true
    }));

    return [...beforeNotes, ...mappedDynamic, notesStep];
  }, [dynamicQuestions]);

  const [submissionCount, setSubmissionCount] = useState(0);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    if (user?.experimentId && user?.classId && user?.id) {
      // Fetch submission count
      getUserSubmissionCount(user.experimentId, user.classId, user.id)
        .then(count => setSubmissionCount(count));

      // Fetch Dynamic Questions for this class
      fetchActiveQuestions(user.experimentId, user.classId)
        .then(qs => setDynamicQuestions(qs))
        .catch(err => console.error("Failed to fetch questions", err));
    }
  }, [user]);

  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (step === steps.length && saveStatus === 'idle') {
      if (!user?.experimentId || !user?.classId || !user?.id) {
        console.error("Missing user context");
        setSaveStatus('error');
        setSaveError('Missing User Context');
        return;
      }

      setSaveStatus('saving');
      saveSleepEntry(user.experimentId, user.classId, user.id, answers)
        .then(() => {
          setSaveStatus('success');
          // Re-fetch the true count from DB to handle upserts (prevent double counting)
          getUserSubmissionCount(user.experimentId, user.classId, user.id)
            .then(count => setSubmissionCount(count));
        })
        .catch((err) => {
          console.error("Failed to save sleep entry", err);
          setSaveStatus('error');
          setSaveError(err.message || "Unknown DB Error");
        });
    }
  }, [step, answers, steps.length, user, saveStatus]);

  // If Game is active, show overlay
  if (showGame) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
        <GalacticGame dayCount={submissionCount} onClose={() => setShowGame(false)} userId={user?.id} />
      </div>
    );
  }

  // Success Screen
  if (step >= steps.length) {
    return (
      <SuccessScreen
        submissionCount={submissionCount}
        saveStatus={saveStatus}
        saveError={saveError}
        onShowGame={() => setShowGame(true)}
        onLogout={logout}
      />
    );
  }

  // ---------------- WELCOME VIEW ----------------
  if (view === "welcome") {
    return (
      <StudentWelcomeScreen
        onStart={() => setView("form")}
        onLogout={logout}
        submissionCount={submissionCount}
        experimentId={user?.experimentId}
        classId={user?.classId}
        studentId={user?.id}
      />
    );
  }

  // ---------------- FORM VIEW ----------------
  const current = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const canGoNext = current.optional || (
    current.type === "multi" ? (answers[current.key] && answers[current.key].length > 0) : String(answers[current.key] || "").trim() !== ""
  );

  const toggleMultiSelect = (val) => {
    const currentList = answers[current.key] || [];
    const newList = currentList.includes(val) ? currentList.filter(i => i !== val) : [...currentList, val];
    setAnswers({ ...answers, [current.key]: newList });
  };

  // Define Background Elements for SpaceLayout
  const backgroundElements = (
    <>
      {/* 🟢 SVG ANIMATION PAPER LAYER */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* MOON SVG - Top Left */}
        <svg className="absolute top-[10%] left-[10%] w-24 h-24 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-float" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="url(#moonGradient)" />
          <defs>
            <radialGradient id="moonGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(30 30) rotate(51.3402) scale(64.0312)">
              <stop stopColor="#F6F6F6" />
              <stop offset="1" stopColor="#9CA3AF" />
            </radialGradient>
          </defs>
        </svg>

        {/* SHOOTING STARS */}
        <div className="absolute top-[20%] right-[5%] w-[150px] h-[2px] bg-gradient-to-l from-transparent via-white to-transparent opacity-0 animate-[shooting_4s_ease-in-out_infinite] rotate-[45deg]" />
        <div className="absolute top-[50%] left-[10%] w-[100px] h-[2px] bg-gradient-to-l from-transparent via-cyan-200 to-transparent opacity-0 animate-[shooting_6s_ease-in-out_infinite_2s] rotate-[45deg]" />
        <div className="absolute top-[10%] right-[30%] w-[200px] h-[1px] bg-gradient-to-l from-transparent via-indigo-300 to-transparent opacity-0 animate-[shooting_5s_ease-in-out_infinite_1s] rotate-[45deg]" />
      </div>

      {/* 🔵 TOP BAR: 14-DAY PROGRESS */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30 flex justify-center pointer-events-none">
        <div className="glass-panel px-6 py-2 rounded-full flex gap-4 items-center shadow-lg transform scale-90 sm:scale-100">
          <span className="text-xs font-bold text-cyan-300 tracking-wider">MISSION PROGRESS</span>
          <div className="w-32 h-2 bg-indigo-950 rounded-full overflow-hidden border border-indigo-500/30">
            <div
              className="h-full bg-cyan-400 shadow-[0_0_10px_#00f3ff]"
              style={{ width: `${Math.min(100, (submissionCount / 14) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-white">{submissionCount}/14 DAYS</span>
        </div>
      </div>
    </>
  );

  return (
    <SpaceLayout backgroundChildren={backgroundElements}>
      <GlassCard className="w-full max-w-lg mt-12" animateFloat={true} glowColor="indigo">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-mono text-[var(--text-secondary)]">STAGE {step + 1}/{steps.length}</span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">{progress}%</span>
          </div>
          <div className="h-1 w-full bg-indigo-900/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_10px_#00f3ff]"
              style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}
            />
          </div>
        </div>

        {/* Question Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center leading-tight drop-shadow-lg scale-100 transition-transform duration-300">
          {current.title}
        </h2>

        {/* Dynamic Input Area */}
        <QuestionInput
          current={current}
          answers={answers}
          setAnswers={setAnswers}
          setStep={setStep}
          step={step}
          toggleMultiSelect={toggleMultiSelect}
        />

        {/* Navigation Actions */}
        <div className="flex flex-col gap-3">
          {(current.type === "multi" || current.type === "text") && (
            <button
              onClick={() => canGoNext && setStep(step + 1)}
              disabled={!canGoNext}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:-translate-y-1 transition-all"
            >
              המשך לשלב הבא ➜
            </button>
          )}

          {/* Modified back button logic */}
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-[var(--text-secondary)] hover:text-cyan-400 transition-colors py-2"
            >
              חזרה אחורה
            </button>
          ) : (
            <button
              onClick={() => {
                setStep(0);
                setAnswers({});
                setView("welcome"); // Back to welcome
              }}
              className="text-sm text-[var(--text-secondary)] hover:text-cyan-400 transition-colors py-2"
            >
              חזרה אחורה
            </button>
          )}
        </div>

      </GlassCard>
    </SpaceLayout>
  );
}