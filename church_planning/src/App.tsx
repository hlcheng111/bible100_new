import { useCallback, useEffect, useState } from "react";
import { DIMENSIONS, type ChurchSize, type Dimension } from "./dimensions";
import { questionsForDimension } from "./data/churchHealthQuestions";
import { loadState, saveState } from "./storage";
import { ProfileStep } from "./wizard/ProfileStep";
import { DimensionStep } from "./wizard/DimensionStep";
import { FinalHub } from "./wizard/FinalHub";
import { shouldOpenPdcaHub } from "./urlOpen";

const STEP_PROFILE = 0;
const STEP_FINAL = 11;

export default function App() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [churchSize, setChurchSize] = useState<ChurchSize | null>(null);
  const [churchName, setChurchName] = useState("");
  const [reporterRole, setReporterRole] = useState("");
  const [wizardStep, setWizardStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadState();
    setAnswers(s.answers);
    setChurchSize(s.churchSize);
    setChurchName(s.churchName);
    setReporterRole(s.reporterRole);
    const jumpPdca = shouldOpenPdcaHub();
    setWizardStep(jumpPdca ? STEP_FINAL : s.wizardStep);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({
      answers,
      churchSize,
      churchName,
      reporterRole,
      wizardStep,
    });
  }, [answers, churchSize, churchName, reporterRole, wizardStep, hydrated]);

  const onAnswer = useCallback((id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const dimForStep = (step: number): Dimension | null => {
    if (step < 1 || step > 10) return null;
    return DIMENSIONS[step - 1]!;
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] text-lg text-slate-600">
        載入本機進度… Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-50 border-b border-indigo-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-lg font-black leading-tight text-indigo-700 md:text-xl">
            教會 SWOT 診斷系統{" "}
            <span className="block text-sm font-bold text-slate-600 md:inline md:text-base">
              Church SWOT AI 2026
            </span>
          </h1>
          {wizardStep > 0 && wizardStep < STEP_FINAL && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-800">
              步驟 Step {wizardStep} / 10
            </span>
          )}
          {wizardStep === STEP_FINAL && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
              總覽 Hub
            </span>
          )}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-10">
        {wizardStep === STEP_PROFILE && (
          <ProfileStep
            churchName={churchName}
            onChurchName={setChurchName}
            reporterRole={reporterRole}
            onReporterRole={setReporterRole}
            churchSize={churchSize}
            onChurchSize={setChurchSize}
            onStart={() => setWizardStep(1)}
          />
        )}

        {wizardStep >= 1 && wizardStep <= 10 && (
          (() => {
            const dim = dimForStep(wizardStep)!;
            const qs = questionsForDimension(dim);
            return (
              <DimensionStep
                dim={dim}
                questions={qs}
                answers={answers}
                onAnswer={onAnswer}
                stepIndex={wizardStep}
                onPrev={() =>
                  setWizardStep((s) => (s <= 1 ? STEP_PROFILE : s - 1))
                }
                onNext={() =>
                  setWizardStep((s) => (s >= 10 ? STEP_FINAL : s + 1))
                }
              />
            );
          })()
        )}

        {wizardStep === STEP_FINAL && (
          <FinalHub
            answers={answers}
            churchSize={churchSize}
            churchName={churchName}
            reporterRole={reporterRole}
            onBackToEdit={() => setWizardStep(10)}
            initialTab={shouldOpenPdcaHub() ? "pdca" : "report"}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
        試用版 · 資料存於本機 · Trial · local only
      </footer>
    </div>
  );
}
