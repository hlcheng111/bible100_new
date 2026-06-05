import {
  evaluateTowsRecommendations,
  visibleTowsForUi,
} from "../analytics/towsEngine";
import { computeBurnoutSignal } from "../analytics/burnoutSignal";
import { derivePastoralDiagnosisLabel } from "../analytics/strategicReport";
import { dimensionsWhereWeaknessDominates } from "../scoring";
import { weightedGlobalQuadAverage } from "../analytics/weighted";
import { CHURCH_HEALTH_QUESTIONS } from "../data/churchHealthQuestions";
import { computePeaceIndex } from "../analytics/peaceIndex";
import { runStateMachineAnalysis } from "../analytics/stateMachine";
import {
  DIMENSION_LABELS_EN,
  DIMENSION_LABELS_ZH,
  type Dimension,
} from "../dimensions";
import { DimensionBarChart } from "./DimensionBarChart";

type Props = {
  answers: Record<string, number>;
};

/** 淺色版即時看板（隨每題作答重算） */
export function RightStrategyBoard({ answers }: Props) {
  const tags = dimensionsWhereWeaknessDominates(answers);
  const answeredCount = Object.keys(answers).length;
  const machine = runStateMachineAnalysis(answers);
  const tows = evaluateTowsRecommendations(answers, machine);
  const visibleTows = visibleTowsForUi(tows);
  const peace = computePeaceIndex(answers);
  const burnout = computeBurnoutSignal(answers);
  const diagnosis = derivePastoralDiagnosisLabel(answers);
  const oGlob = weightedGlobalQuadAverage("O", CHURCH_HEALTH_QUESTIONS, answers);
  const tGlob = weightedGlobalQuadAverage("T", CHURCH_HEALTH_QUESTIONS, answers);

  return (
    <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-3 text-slate-800">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          實時戰略看板 · Church SWOT live board
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">
          十維達標柱狀圖（0–50 參考分＋平均線）
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          已作答 {answeredCount}／160；紅虛線為「已填維度」之平均，柱高過線表示優於平均。觸發門檻：加權均分
          ≥ 2.5。
        </p>
      </header>

      {machine.forceConsolidate && (
        <div className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-bold text-amber-900">
            【強制整固】Forced consolidation
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {machine.reasons.slice(0, 4).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-2 text-amber-900/90">
            已抑制高耗能 SO 建議；優先安息與內部醫治。
          </p>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <p className="font-bold text-slate-900">狀態機 State</p>
        <p className="mt-1 text-slate-700">
          判定：
          <span className="ml-1 font-mono font-semibold text-indigo-700">
            {machine.state === "expand"
              ? "擴張 Expand"
              : machine.state === "consolidate"
                ? "整固 Consolidate"
                : "轉型 Transform"}
          </span>
        </p>
        <p className="mt-2 text-slate-600">
          PeaceIndex {(peace.value >= 0 ? "+" : "") + peace.value.toFixed(2)}（S
          {peace.s.toFixed(1)} · O{peace.o.toFixed(1)} · W{peace.w.toFixed(1)} · T
          {peace.t.toFixed(1)}）
        </p>
        <p className="mt-1 text-slate-600">
          Burnout_Signal：{burnout === null ? "—" : burnout.toFixed(2)}
        </p>
        <p className="mt-1 text-slate-600">
          Ō {oGlob === null ? "—" : oGlob.toFixed(2)} · T̄{" "}
          {tGlob === null ? "—" : tGlob.toFixed(2)}
        </p>
      </section>

      <div className="min-h-[300px] w-full shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-inner">
        <DimensionBarChart answers={answers} height={300} compactLabels />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800">
          關鍵標籤 · Key tags
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <span className="text-sm text-slate-500">
              尚無 W̄ &gt; S̄ 之維度，或 S／W 資料不足。
            </span>
          ) : (
            tags.map((t: Dimension) => (
              <span
                key={t}
                className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-900"
              >
                {DIMENSION_LABELS_ZH[t]} ({DIMENSION_LABELS_EN[t]}) · 劣勢偏高
              </span>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800">TOWS · 規則引擎</h3>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
          {visibleTows.map((r) => (
            <li key={r.archetype}>
              <span className="font-bold text-slate-900">
                {r.archetype} · {r.title}
              </span>
              {r.suppressed && (
                <span className="ml-1 text-amber-700">（已抑制）</span>
              )}
              <p className="mt-0.5">{r.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          <span className="font-bold text-slate-900">診斷標籤 · Archetype</span>{" "}
          {diagnosis.title}
        </p>
        <p className="mt-1">{diagnosis.subtitle}</p>
      </section>
    </div>
  );
}
