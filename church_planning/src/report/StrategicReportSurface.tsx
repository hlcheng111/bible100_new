import { DimensionBarChart } from "../components/DimensionBarChart";
import type { ChurchSize } from "../dimensions";
import {
  CHURCH_SIZE_LABELS,
  DIMENSION_LABELS_ZH,
  DIMENSIONS,
} from "../dimensions";
import { computePeaceIndex } from "../analytics/peaceIndex";
import { runStateMachineAnalysis } from "../analytics/stateMachine";
import { evaluateTowsRecommendations } from "../analytics/towsEngine";
import { computeBurnoutSignal } from "../analytics/burnoutSignal";
import {
  derivePastoralDiagnosisLabel,
  deriveStopMustPlan,
  pastoralOpeningLine,
  primaryBurdenDimension,
} from "../analytics/strategicReport";
import { weightedDimQuadAverage } from "../analytics/weighted";
import { CHURCH_HEALTH_QUESTIONS } from "../data/churchHealthQuestions";
import { buildSmartDraftLines } from "./smartDraft";

type Props = {
  answers: Record<string, number>;
  churchSize: ChurchSize | null;
  churchName?: string;
};

const pageShell =
  "chp-print-page box-border w-[min(920px,100%)] rounded-lg border border-slate-200 bg-white p-8 text-slate-900 shadow-sm";

export function StrategicReportSurface({
  answers,
  churchSize,
  churchName,
}: Props) {
  const machine = runStateMachineAnalysis(answers);
  const peace = computePeaceIndex(answers);
  const burnout = computeBurnoutSignal(answers);
  const diagnosis = derivePastoralDiagnosisLabel(answers);
  const tows = evaluateTowsRecommendations(answers, machine);
  const stopMust = deriveStopMustPlan(answers, machine, tows);
  const opening = pastoralOpeningLine(peace.value, machine);
  const stateLabel =
    machine.state === "expand"
      ? "擴張"
      : machine.state === "consolidate"
        ? "整固"
        : "轉型";

  const topBurden = primaryBurdenDimension(answers);
  const smartLines = buildSmartDraftLines(
    machine.state,
    diagnosis,
    stopMust,
    topBurden
  );

  const fmt = (v: number | null) =>
    v === null ? "—" : v.toFixed(2);

  return (
    <div
      id="chp-report-root"
      className="flex flex-col gap-10"
      style={{ fontFamily: '"Noto Sans TC","DM Sans",sans-serif' }}
    >
      {/* —— P1：牧者安慰 + 體質標籤 + 雷達 —— */}
      <div id="chp-report-p1" className={pageShell}>
        <header className="border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Church SWOT AI 2026 · 第 1 頁／共 3 頁
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            教會 SWOT 診斷與 TOWS 規劃書（草案）
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {churchName ? `教會 Church: ${churchName} · ` : ""}
            規模 Size：
            {churchSize ? CHURCH_SIZE_LABELS[churchSize] : "未填寫"} · 產出／Generated：
            {new Date().toLocaleString("zh-TW")}
          </p>
        </header>

        <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            一、牧者安慰與平安感（PeaceIndex）
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{opening}</p>
          <p className="mt-3 text-xs text-slate-600">
            PeaceIndex = (S̄ + Ō − W̄ − T̄) ÷ 4 ≈{" "}
            <span className="font-mono font-semibold">
              {peace.value.toFixed(2)}
            </span>
            （S̄ {peace.s.toFixed(2)} · Ō {peace.o.toFixed(2)} · W̄{" "}
            {peace.w.toFixed(2)} · T̄ {peace.t.toFixed(2)}；未作答象限以中性 2.0
            補齊）
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Burnout_Signal（跨維度疲憊標籤聚合）：
            {burnout === null ? "資料不足" : burnout.toFixed(2)}
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-800">
            二、體質標籤與狀態機
          </h2>
          <p className="mt-2 text-base font-medium text-slate-900">
            {diagnosis.title}
          </p>
          <p className="mt-1 text-sm text-slate-700">{diagnosis.subtitle}</p>
          <p className="mt-3 text-sm text-slate-700">
            戰略狀態判定：
            <span className="font-semibold">{stateLabel}</span>
            {machine.forceConsolidate ? "（含強制整固覆寫）" : ""}
          </p>
          {machine.reasons.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
              {machine.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-800">
            三、十維達標柱狀圖（0–50 參考分＋平均線）
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            與長期計劃戰情可並讀：紅虛線為已填維度平均；柱低於約 30 表示該維度整體填答偏保守、宜優先對話。
          </p>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2">
            <DimensionBarChart answers={answers} height={280} />
          </div>
        </section>
      </div>

      {/* —— P2：TOWS + 停做／必做 —— */}
      <div id="chp-report-p2" className={pageShell}>
        <header className="border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Church SWOT AI 2026 · 第 2 頁／共 3 頁
          </p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            TOWS 戰略與避重就輕
          </h1>
        </header>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-800">
            四、TOWS 交叉矩陣（規則引擎）
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            一般觸發：加權平均 ≥ 2.5。WT 具最高優先權；觸發強制整固時抑制高耗能 SO。
          </p>
          <table className="mt-3 w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="p-2">類型</th>
                <th className="p-2">觸發</th>
                <th className="p-2">建議摘要</th>
              </tr>
            </thead>
            <tbody>
              {tows.map((r) => (
                <tr key={r.archetype} className="border-b border-slate-100">
                  <td className="p-2 font-mono">{r.archetype}</td>
                  <td className="p-2">
                    {r.triggered ? "是" : "否"}
                    {r.suppressed ? "（已抑制）" : ""}
                  </td>
                  <td className="p-2 text-slate-700">{r.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 rounded-xl border border-rose-100 bg-rose-50/60 p-4">
          <h2 className="text-sm font-semibold text-rose-900">
            五、避重就輕：停做 3／必做 1
          </h2>
          <p className="mt-2 text-xs font-semibold text-rose-800">停做（Stop）</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-rose-900">
            {stopMust.stop.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="mt-4 text-xs font-semibold text-emerald-900">必做（Must）</p>
          <p className="mt-1 text-sm text-emerald-900">{stopMust.must}</p>
        </section>

        <p className="mt-6 text-[10px] text-slate-500">
          PDF 本頁為獨立截圖頁面；列印時可配合瀏覽器「另存 PDF」與分頁樣式。
        </p>
      </div>

      {/* —— P3：十維數據表 + SMART + 簽署 —— */}
      <div id="chp-report-p3" className={pageShell}>
        <header className="border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Church SWOT AI 2026 · 第 3 頁／共 3 頁
          </p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            數據明細與五年計畫草案
          </h1>
        </header>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-800">
            六、十維度加權均分（0–4 量表）
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            「—」表示該象限尚無有效作答。第 1 頁柱狀圖之 0–50 分由本表各題 Likert 均值換算。
          </p>
          <table className="mt-3 w-full border-collapse border border-slate-200 text-left text-[11px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 p-2">維度</th>
                <th className="border border-slate-200 p-2">S̄</th>
                <th className="border border-slate-200 p-2">W̄</th>
                <th className="border border-slate-200 p-2">Ō</th>
                <th className="border border-slate-200 p-2">T̄</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((dim) => (
                <tr key={dim}>
                  <td className="border border-slate-200 p-2 font-medium">
                    {DIMENSION_LABELS_ZH[dim]}
                  </td>
                  <td className="border border-slate-200 p-2 font-mono">
                    {fmt(
                      weightedDimQuadAverage(
                        dim,
                        "S",
                        CHURCH_HEALTH_QUESTIONS,
                        answers
                      )
                    )}
                  </td>
                  <td className="border border-slate-200 p-2 font-mono">
                    {fmt(
                      weightedDimQuadAverage(
                        dim,
                        "W",
                        CHURCH_HEALTH_QUESTIONS,
                        answers
                      )
                    )}
                  </td>
                  <td className="border border-slate-200 p-2 font-mono">
                    {fmt(
                      weightedDimQuadAverage(
                        dim,
                        "O",
                        CHURCH_HEALTH_QUESTIONS,
                        answers
                      )
                    )}
                  </td>
                  <td className="border border-slate-200 p-2 font-mono">
                    {fmt(
                      weightedDimQuadAverage(
                        dim,
                        "T",
                        CHURCH_HEALTH_QUESTIONS,
                        answers
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-800">
            七、五年計畫初步草案（SMART 引導式語氣）
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-xs leading-relaxed text-slate-700">
            {smartLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            八、領袖禱告與簽署（屬靈立約）
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            我們承認數據僅為察驗工具，真正的方向仍須倚靠聖靈引導。以下留白，供核心領袖在禱告後署名，將診斷轉為同工彼此立約的紀念。
          </p>
          <div className="mt-6 space-y-6 text-sm text-slate-700">
            <div>
              <p className="text-xs text-slate-500">禱告聚焦（一句話）</p>
              <div className="mt-2 h-10 border-b border-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">核心領袖簽名</p>
              <div className="mt-2 h-10 border-b border-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">日期</p>
              <div className="mt-2 h-10 w-1/2 border-b border-slate-400" />
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-3 text-[10px] text-slate-500">
          本報告由本機作答資料演算，供內部牧養與長執討論；不代表絕對判斷。PDF
          以三段 HTML 區塊各自截圖匯出（三頁），中文以網頁字型渲染為圖像。
        </footer>
      </div>
    </div>
  );
}
