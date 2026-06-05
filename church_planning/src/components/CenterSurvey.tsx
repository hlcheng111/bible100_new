import type { ChurchSize } from "../dimensions";
import { CHURCH_SIZE_LABELS, DIMENSION_LABELS_ZH } from "../dimensions";
import {
  CHURCH_HEALTH_QUESTIONS,
  QUESTIONS_PER_PAGE,
} from "../data/churchHealthQuestions";

const LIKERT = [
  { value: 0, short: "0", label: "完全不符合" },
  { value: 1, short: "1", label: "少數如此" },
  { value: 2, short: "2", label: "部分如此" },
  { value: 3, short: "3", label: "大致如此" },
  { value: 4, short: "4", label: "非常符合" },
] as const;

type Props = {
  churchSize: ChurchSize | null;
  onChurchSize: (s: ChurchSize) => void;
  pageIndex: number;
  onPageIndex: (n: number) => void;
  answers: Record<string, number>;
  onAnswer: (id: string, value: number) => void;
};

export function CenterSurvey({
  churchSize,
  onChurchSize,
  pageIndex,
  onPageIndex,
  answers,
  onAnswer,
}: Props) {
  const bank = CHURCH_HEALTH_QUESTIONS;
  const totalPages = Math.ceil(bank.length / QUESTIONS_PER_PAGE);
  const start = pageIndex * QUESTIONS_PER_PAGE;
  const pageQs = bank.slice(start, start + QUESTIONS_PER_PAGE);
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / bank.length) * 100);

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400/90">
            Church Health Pro 2026
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-white">
            教會版 SWOT 深度診斷
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            以現象描述評估真實體質（160 題 · 加權戰略引擎）。每題 0–4 分；資料僅存於本機（localStorage）。
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">作答進度</p>
          <p className="text-lg font-semibold text-slate-200">
            {answered} / {bank.length}
          </p>
          <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-sky-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-700/80 bg-slate-900/45 p-5 shadow-xl shadow-black/20">
        <h2 className="font-serif text-sm font-semibold text-amber-200/90">
          背景校準 · 教會規模
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          後續報告語氣與建議強度將依規模調整（微／小／中／大）。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(CHURCH_SIZE_LABELS) as ChurchSize[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onChurchSize(k)}
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                churchSize === k
                  ? "border-amber-500/60 bg-amber-950/40 text-amber-100"
                  : "border-slate-600/80 bg-slate-950/30 text-slate-300 hover:border-slate-500"
              }`}
            >
              {CHURCH_SIZE_LABELS[k]}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-sm font-semibold text-slate-200">
            現象描述問卷 · 第 {pageIndex + 1} / {totalPages} 頁
          </h2>
          <span className="text-xs text-slate-500">每頁 {QUESTIONS_PER_PAGE} 題</span>
        </div>

        <div className="grid gap-4">
          {pageQs.map((q) => (
            <article
              key={q.id}
              className="rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-5 shadow-lg shadow-black/15"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-slate-300">
                  {q.id}
                </span>
                <span className="rounded-md bg-emerald-950/60 px-2 py-0.5 text-emerald-300">
                  {DIMENSION_LABELS_ZH[q.dim]}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 ${
                    q.quad === "S"
                      ? "bg-green-950/50 text-green-300"
                      : q.quad === "W"
                        ? "bg-rose-950/50 text-rose-300"
                        : q.quad === "O"
                          ? "bg-sky-950/50 text-sky-300"
                          : "bg-amber-950/50 text-amber-200"
                  }`}
                >
                  {q.quad === "S"
                    ? "優勢 S"
                    : q.quad === "W"
                      ? "劣勢 W"
                      : q.quad === "O"
                        ? "機會 O"
                        : "威脅 T"}
                </span>
                <span className="rounded-md bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                  {q.tag}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-100">
                {q.text}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {LIKERT.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onAnswer(q.id, opt.value)}
                    title={opt.label}
                    className={`flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-2 text-center transition ${
                      answers[q.id] === opt.value
                        ? "border-sky-500/70 bg-sky-950/50 text-sky-100"
                        : "border-slate-600/80 bg-slate-950/40 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-lg font-semibold">{opt.short}</span>
                    <span className="mt-0.5 max-w-[5.5rem] text-[10px] leading-tight text-slate-500">
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <nav className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <button
          type="button"
          disabled={pageIndex <= 0}
          onClick={() => onPageIndex(pageIndex - 1)}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 disabled:opacity-40"
        >
          上一頁
        </button>
        <button
          type="button"
          disabled={pageIndex >= totalPages - 1}
          onClick={() => onPageIndex(pageIndex + 1)}
          className="rounded-xl border border-sky-600/60 bg-sky-950/40 px-4 py-2 text-sm font-medium text-sky-100 disabled:opacity-40"
        >
          下一頁
        </button>
      </nav>
    </main>
  );
}
