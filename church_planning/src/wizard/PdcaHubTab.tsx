import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DIMENSION_LABELS_ZH,
  DIMENSIONS,
  type Dimension,
} from "../dimensions";
import { computePeaceIndex } from "../analytics/peaceIndex";
import { derivePastoralDiagnosisLabel } from "../analytics/strategicReport";
import { runStateMachineAnalysis } from "../analytics/stateMachine";
import { evaluateTowsRecommendations } from "../analytics/towsEngine";
import { deriveStopMustPlan } from "../analytics/strategicReport";
import {
  aggregateWeakStageCounts,
  analyzeWeakStages,
  dominantWeakStage,
} from "../pdca/pdcaAnalysis";
import { createEmptyPdcaCycle, createEmptySmartGoal } from "../pdca/emptyCycle";
import { loadPdcaState, savePdcaState } from "../pdca/pdcaStorage";
import { buildSmartGoalFromAnswers } from "../pdca/smartImport";
import type { PdcaCycleRecord, PdcaPersistedState, SmartGoalRecord } from "../pdca/types";

type Props = {
  answers: Record<string, number>;
  churchName: string;
  onOpenReportTab: () => void;
};

const STAGE_ZH = {
  plan: "Plan 計畫",
  do: "Do 執行",
  check: "Check 檢核",
  act: "Act 處置",
} as const;

function touchCycle(c: PdcaCycleRecord): PdcaCycleRecord {
  return { ...c, updatedAt: new Date().toISOString() };
}

export function PdcaHubTab({
  answers,
  churchName,
  onOpenReportTab,
}: Props) {
  const [state, setState] = useState<PdcaPersistedState>(() => loadPdcaState());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [smartDraftId, setSmartDraftId] = useState<string | null>(null);

  useEffect(() => {
    savePdcaState(state);
  }, [state]);

  const peace = useMemo(() => computePeaceIndex(answers), [answers]);
  const diagnosis = useMemo(
    () => derivePastoralDiagnosisLabel(answers),
    [answers]
  );
  const machine = useMemo(() => runStateMachineAnalysis(answers), [answers]);
  const tows = useMemo(
    () => evaluateTowsRecommendations(answers, machine),
    [answers, machine]
  );
  const stopMust = useMemo(
    () => deriveStopMustPlan(answers, machine, tows),
    [answers, machine, tows]
  );

  const weakAgg = useMemo(
    () => aggregateWeakStageCounts(state.cycles),
    [state.cycles]
  );
  const topWeak = dominantWeakStage(weakAgg);

  const upsertCycle = useCallback((c: PdcaCycleRecord) => {
    setState((s) => ({
      ...s,
      cycles: s.cycles.some((x) => x.id === c.id)
        ? s.cycles.map((x) => (x.id === c.id ? c : x))
        : [...s.cycles, c],
    }));
  }, []);

  const removeCycle = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      cycles: s.cycles.filter((c) => c.id !== id),
    }));
    setExpandedId((e) => (e === id ? null : e));
  }, []);

  const addSmartFromReport = useCallback(() => {
    const g = buildSmartGoalFromAnswers(answers);
    setState((s) => ({ ...s, smartGoals: [...s.smartGoals, g] }));
    setSmartDraftId(g.id);
  }, [answers]);

  const upsertSmart = useCallback((g: SmartGoalRecord) => {
    setState((s) => ({
      ...s,
      smartGoals: s.smartGoals.some((x) => x.id === g.id)
        ? s.smartGoals.map((x) => (x.id === g.id ? g : x))
        : [...s.smartGoals, g],
    }));
  }, []);

  const removeSmart = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      smartGoals: s.smartGoals.filter((g) => g.id !== id),
      cycles: s.cycles.map((c) =>
        c.linkedSmartGoalId === id ? { ...c, linkedSmartGoalId: null } : c
      ),
    }));
    setSmartDraftId((d) => (d === id ? null : d));
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <header className="rounded-3xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
          教會版 PDCA · 一路通儀表
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
          健康 → SWOT → SMART → PDCA
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700">
          資料欄位<strong>不因堂會大小而減少</strong>，大中小型同一套實況問卷，方便累積與對齊五年計劃。
          這裡<strong>不替您打分考核</strong>，只幫您看見「哪一環常空著」— 尤其是{" "}
          <strong>Check 檢核</strong>。
        </p>
        <ol className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-slate-800">
          {[
            { n: "①", t: "十維健康診斷", d: "現況與體質" },
            { n: "②", t: "教會版 SWOT", d: "策略焦點" },
            { n: "③", t: "SMART 目標庫", d: "可驗收" },
            { n: "④", t: "PDCA 循環", d: "執行與學習" },
          ].map((x) => (
            <li
              key={x.n}
              className="rounded-2xl border border-violet-200 bg-white/90 px-3 py-2 shadow-sm"
            >
              <span className="text-violet-600">{x.n}</span> {x.t}
              <span className="ml-1 text-xs font-normal text-slate-500">
                {x.d}
              </span>
            </li>
          ))}
        </ol>
      </header>

      {/* 本季三件要事 — 仍為完整敘述欄，非精簡版 */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
        <h3 className="text-lg font-black text-amber-900">
          本季聚焦三件事（文字自訂）
        </h3>
        <p className="mt-1 text-sm text-amber-950/80">
          與異象／五年計劃對齊的三句話，儀表板上一眼看到優先序。
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <label key={i} className="block text-sm font-bold text-slate-800">
              要事 {i + 1}
              <textarea
                rows={3}
                className="mt-1 w-full rounded-xl border border-amber-200 bg-white p-2 text-sm font-normal text-slate-800 shadow-inner"
                value={state.seasonFocusLines[i]}
                onChange={(e) => {
                  const next = [...state.seasonFocusLines] as [
                    string,
                    string,
                    string,
                  ];
                  next[i] = e.target.value;
                  setState((s) => ({ ...s, seasonFocusLines: next }));
                }}
                placeholder="例：完成聖誕節期預演兩次、建立招待閉環…"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <h3 className="text-base font-black text-indigo-800">
            健康診斷快照
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {churchName ? `「${churchName}」` : "本教會"} · 來自已儲存的十維作答
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {diagnosis.title}
          </p>
          <p className="mt-1 text-sm text-slate-700">{diagnosis.subtitle}</p>
          <p className="mt-3 text-xs text-slate-500">
            PeaceIndex ≈ {peace.value.toFixed(2)}（未答滿亦可預覽）
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <h3 className="text-base font-black text-indigo-800">SWOT 摘要</h3>
          <p className="mt-3 text-sm font-bold text-slate-800">必做 1</p>
          <p className="text-sm text-slate-700">{stopMust.must}</p>
          <p className="mt-3 text-sm font-bold text-slate-800">停做／縮減參考</p>
          <ul className="list-inside list-disc text-sm text-slate-700">
            {stopMust.stop.slice(0, 3).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onOpenReportTab}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow"
          >
            開啟完整 SWOT 報告
          </button>
        </section>
      </div>

      {/* SMART */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-black text-emerald-900">
            SMART 目標庫（五欄完整）
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addSmartFromReport}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow"
            >
              從診斷報告匯入一筆草案
            </button>
            <button
              type="button"
              onClick={() => {
                const g = createEmptySmartGoal();
                setState((s) => ({ ...s, smartGoals: [...s.smartGoals, g] }));
                setSmartDraftId(g.id);
              }}
              className="rounded-xl border border-emerald-600 bg-white px-4 py-2 text-sm font-bold text-emerald-800"
            >
              新增空白目標
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {state.smartGoals.length === 0 && (
            <p className="text-sm text-slate-600">
              尚無目標。可先按「匯入草案」或手動新增。
            </p>
          )}
          {state.smartGoals.map((g) => (
            <SmartGoalEditor
              key={g.id}
              goal={g}
              expanded={smartDraftId === g.id || state.smartGoals.length === 1}
              onChange={(ng) => upsertSmart(ng)}
              onRemove={() => removeSmart(g.id)}
              onToggleExpand={() =>
                setSmartDraftId((id) => (id === g.id ? null : g.id))
              }
            />
          ))}
        </div>
      </section>

      {/* 歷史弱點聚合 */}
      {state.cycles.length > 0 && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
          <h3 className="text-lg font-black text-rose-900">
            PDCA 預警（規則式）
          </h3>
          <p className="mt-1 text-sm text-rose-950/80">
            統計已存檔的循環：哪一階欄位常空白或未完成。優先關注：
            {topWeak ? (
              <strong className="ml-1">{STAGE_ZH[topWeak]}</strong>
            ) : (
              <span className="ml-1">資料不足</span>
            )}
          </p>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {(Object.keys(weakAgg) as (keyof typeof weakAgg)[]).map((k) => (
              <li
                key={k}
                className="rounded-lg bg-white px-3 py-1 font-mono text-rose-900 shadow-sm"
              >
                {STAGE_ZH[k]}：{weakAgg[k]}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PDCA cycles */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black text-slate-900">
            教會版 PDCA 循環
          </h3>
          <button
            type="button"
            onClick={() => {
              const c = createEmptyPdcaCycle();
              upsertCycle(c);
              setExpandedId(c.id);
            }}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
          >
            ＋ 新增一輪循環
          </button>
        </div>

        {state.cycles.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            建議綁定主日、節期或專案名稱；每一輪都包含 Plan／Do／Check／Act
            完整欄位，與 SMART 可選連結。
          </p>
        )}

        {state.cycles.map((c) => (
          <PdcaCycleCard
            key={c.id}
            cycle={c}
            smartGoals={state.smartGoals}
            expanded={expandedId === c.id}
            weak={analyzeWeakStages(c)}
            onToggle={() =>
              setExpandedId((id) => (id === c.id ? null : c.id))
            }
            onChange={(nc) => upsertCycle(touchCycle(nc))}
            onRemove={() => removeCycle(c.id)}
          />
        ))}
      </section>
    </div>
  );
}

type SmartTextKey =
  | "title"
  | "specific"
  | "measurable"
  | "achievable"
  | "relevant"
  | "timeBound"
  | "swotLinkNote";

function SmartGoalEditor({
  goal,
  expanded,
  onChange,
  onRemove,
  onToggleExpand,
}: {
  goal: SmartGoalRecord;
  expanded: boolean;
  onChange: (g: SmartGoalRecord) => void;
  onRemove: () => void;
  onToggleExpand: () => void;
}) {
  const field = (label: string, key: SmartTextKey, rows = 2) => (
    <label className="block text-xs font-bold uppercase text-slate-600">
      {label}
      <textarea
        rows={rows}
        className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal text-slate-800"
        value={goal[key]}
        onChange={(e) => onChange({ ...goal, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-left text-sm font-black text-emerald-900"
        >
          {expanded ? "▼" : "▶"}{" "}
          {goal.title.trim() || "（無標題 SMART）"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-bold text-rose-600 underline"
        >
          刪除
        </button>
      </div>
      {expanded && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {field("標題 Title", "title", 1)}
          {field("S Specific", "specific", 3)}
          {field("M Measurable", "measurable", 3)}
          {field("A Achievable", "achievable", 3)}
          {field("R Relevant", "relevant", 3)}
          {field("T Time-bound", "timeBound", 2)}
          {field("SWOT／策略連結註記", "swotLinkNote", 2)}
          <div className="md:col-span-2">
            <p className="text-xs font-bold text-slate-600">相關健康維度</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIMENSIONS.map((d) => {
                const on = goal.relatedDimensions.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...goal,
                        relatedDimensions: on
                          ? goal.relatedDimensions.filter((x) => x !== d)
                          : [...goal.relatedDimensions, d],
                      })
                    }
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      on
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {DIMENSION_LABELS_ZH[d]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PdcaCycleCard({
  cycle,
  smartGoals,
  expanded,
  weak,
  onToggle,
  onChange,
  onRemove,
}: {
  cycle: PdcaCycleRecord;
  smartGoals: SmartGoalRecord[];
  expanded: boolean;
  weak: import("../pdca/types").PdcaWeakStage[];
  onToggle: () => void;
  onChange: (c: PdcaCycleRecord) => void;
  onRemove: () => void;
}) {
  const set = (patch: Partial<PdcaCycleRecord>) =>
    onChange({ ...cycle, ...patch });

  const toggleDim = (d: Dimension) => {
    const on = cycle.relatedDimensions.includes(d);
    set({
      relatedDimensions: on
        ? cycle.relatedDimensions.filter((x) => x !== d)
        : [...cycle.relatedDimensions, d],
    });
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-violet-100/80 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="text-left font-black text-violet-950"
        >
          {expanded ? "▼" : "▶"}{" "}
          {cycle.ministryContext.trim() || "（未命名事工／節期）"}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {weak.map((w) => (
            <span
              key={w}
              className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-950"
            >
              待補 {STAGE_ZH[w]}
            </span>
          ))}
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-bold text-rose-600 underline"
          >
            刪除此循環
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-6 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-800">
              事工情境（主日／節期／專案）
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                value={cycle.ministryContext}
                onChange={(e) => set({ ministryContext: e.target.value })}
              />
            </label>
            <label className="text-sm font-bold text-slate-800">
              連結 SMART 目標
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                value={cycle.linkedSmartGoalId ?? ""}
                onChange={(e) =>
                  set({
                    linkedSmartGoalId: e.target.value
                      ? e.target.value
                      : null,
                  })
                }
              >
                <option value="">（不連結）</option>
                {smartGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title.trim() || g.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-xs font-bold text-slate-500">相關健康維度</p>
          <div className="flex flex-wrap gap-2">
            {DIMENSIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDim(d)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  cycle.relatedDimensions.includes(d)
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {DIMENSION_LABELS_ZH[d]}
              </button>
            ))}
          </div>

          <fieldset className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <legend className="px-2 text-sm font-black text-blue-900">
              Plan 計畫
            </legend>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Area label="問題／背景" v={cycle.planProblem} on={(v) => set({ planProblem: v })} />
              <Area label="目標（質化／量化）" v={cycle.planGoal} on={(v) => set({ planGoal: v })} />
              <Area label="資源（人／物／時）" v={cycle.planResources} on={(v) => set({ planResources: v })} />
              <Area label="如何衡量（檢核指標定義）" v={cycle.planMetricsHow} on={(v) => set({ planMetricsHow: v })} />
              <Area label="時程里程碑" v={cycle.planTimeline} on={(v) => set({ planTimeline: v })} />
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <legend className="px-2 text-sm font-black text-amber-900">
              Do 執行（含執行中監察）
            </legend>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Area label="執行紀錄／偏差說明" v={cycle.doProgressNotes} on={(v) => set({ doProgressNotes: v })} rows={4} />
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-800">
                  紅綠燈自評
                  <select
                    className="mt-1 w-full rounded-lg border p-2 text-sm"
                    value={cycle.doTrafficLight}
                    onChange={(e) =>
                      set({
                        doTrafficLight: e.target.value as PdcaCycleRecord["doTrafficLight"],
                      })
                    }
                  >
                    <option value="green">綠 · 正常</option>
                    <option value="yellow">黃 · 需關注</option>
                    <option value="red">紅 · 嚴重滯後</option>
                  </select>
                </label>
                <label className="block text-sm font-bold text-slate-800">
                  預算已用 %（0–100，可空）
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 w-full rounded-lg border p-2 text-sm"
                    value={cycle.doBudgetUsedPercent ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      set({
                        doBudgetUsedPercent:
                          raw === "" ? null : Math.min(100, Math.max(0, Number(raw))),
                      });
                    }}
                  />
                </label>
                <label className="block text-sm font-bold text-slate-800">
                  里程碑完成度 %（可空）
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 w-full rounded-lg border p-2 text-sm"
                    value={cycle.doMilestonePercent ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      set({
                        doMilestonePercent:
                          raw === "" ? null : Math.min(100, Math.max(0, Number(raw))),
                      });
                    }}
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
            <legend className="px-2 text-sm font-black text-teal-900">
              Check 檢核（事後評估）
            </legend>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Likert
                label="目標達成感"
                v={cycle.checkGoalMetLikert}
                on={(n) => set({ checkGoalMetLikert: n })}
              />
              <Likert
                label="資源效率"
                v={cycle.checkResourceLikert}
                on={(n) => set({ checkResourceLikert: n })}
              />
              <Likert
                label="同工狀態（喜樂／疲勞）"
                v={cycle.checkTeamMoraleLikert}
                on={(n) => set({ checkTeamMoraleLikert: n })}
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-1">
              <Area label="事實／數據證據（非感覺）" v={cycle.checkEvidence} on={(v) => set({ checkEvidence: v })} rows={3} />
              <Area label="落差與原因" v={cycle.checkGap} on={(v) => set({ checkGap: v })} rows={3} />
              <Area label="最混亂的一個環節（供歷史比對）" v={cycle.checkChaosMoment} on={(v) => set({ checkChaosMoment: v })} rows={2} />
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
            <legend className="px-2 text-sm font-black text-rose-900">
              Act 處置
            </legend>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Area label="明年／下一輪必須改變的一件事" v={cycle.actMustChange} on={(v) => set({ actMustChange: v })} />
              <label className="text-sm font-bold text-slate-800">
                負責人
                <input
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                  value={cycle.actOwner}
                  onChange={(e) => set({ actOwner: e.target.value })}
                />
              </label>
              <label className="text-sm font-bold text-slate-800">
                預計完成日（文字即可）
                <input
                  className="mt-1 w-full rounded-lg border p-2 text-sm"
                  value={cycle.actDueDate}
                  onChange={(e) => set({ actDueDate: e.target.value })}
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={cycle.actStandardize}
                  onChange={(e) => set({ actStandardize: e.target.checked })}
                />
                納入標準流程／明年 SOP
              </label>
              <Area
                label="下一輪 PDCA 備註"
                v={cycle.actNextCycleNote}
                on={(v) => set({ actNextCycleNote: v })}
                rows={2}
              />
            </div>
          </fieldset>
        </div>
      )}
    </article>
  );
}

function Area({
  label,
  v,
  on,
  rows = 3,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm font-bold text-slate-800">
      {label}
      <textarea
        rows={rows}
        className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal"
        value={v}
        onChange={(e) => on(e.target.value)}
      />
    </label>
  );
}

function Likert({
  label,
  v,
  on,
}: {
  label: string;
  v: number | null;
  on: (n: number | null) => void;
}) {
  return (
    <label className="block text-sm font-bold text-slate-800">
      {label}（1–5）
      <select
        className="mt-1 w-full rounded-lg border p-2 text-sm"
        value={v === null ? "" : String(v)}
        onChange={(e) => {
          const raw = e.target.value;
          on(raw === "" ? null : Number(raw));
        }}
      >
        <option value="">未填</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
