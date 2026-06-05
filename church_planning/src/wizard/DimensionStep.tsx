import type { Dimension } from "../dimensions";
import {
  DIMENSION_LABELS_EN,
  DIMENSION_LABELS_ZH,
} from "../dimensions";
import type { ChurchHealthQuestion, Quadrant } from "../data/churchHealthQuestions";
import { QUAD_BILINGUAL } from "./quadLabels";

const LIKERT = [
  { v: 0, zh: "0 完全不符合", en: "0 Not at all" },
  { v: 1, zh: "1 少數如此", en: "1 Rarely" },
  { v: 2, zh: "2 部分如此", en: "2 Sometimes" },
  { v: 3, zh: "3 大致如此", en: "3 Mostly" },
  { v: 4, zh: "4 非常符合", en: "4 Strongly agree" },
] as const;

type Props = {
  dim: Dimension;
  questions: ChurchHealthQuestion[];
  answers: Record<string, number>;
  onAnswer: (id: string, value: number) => void;
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
};

const QUAD_ORDER: Quadrant[] = ["S", "W", "O", "T"];

function countBefore(quad: Quadrant, questions: ChurchHealthQuestion[]): number {
  const idx = QUAD_ORDER.indexOf(quad);
  let n = 0;
  for (let i = 0; i < idx; i++) {
    n += questions.filter((x) => x.quad === QUAD_ORDER[i]).length;
  }
  return n;
}

export function DimensionStep({
  dim,
  questions,
  answers,
  onAnswer,
  stepIndex,
  onPrev,
  onNext,
}: Props) {
  const byQuad = (q: Quadrant) => questions.filter((x) => x.quad === q);

  return (
    <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-bold text-slate-500">
            範疇 Category {stepIndex} / 10
          </p>
          <h2 className="text-2xl font-black text-indigo-600">
            {DIMENSION_LABELS_ZH[dim]}{" "}
            <span className="text-base font-normal text-slate-400">
              ({DIMENSION_LABELS_EN[dim]})
            </span>
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          0 = 最低 Low · 4 = 最高 High
        </p>
      </div>

      <div className="space-y-8">
        {QUAD_ORDER.map((quad) => {
          const qs = byQuad(quad);
          if (qs.length === 0) return null;
          const lab = QUAD_BILINGUAL[quad];
          return (
            <section key={quad}>
              <h3 className="mb-3 text-lg font-bold text-slate-800">
                {lab.titleZh}{" "}
                <span className="text-sm font-normal text-slate-500">
                  {lab.titleEn}
                </span>
              </h3>
              <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                {qs.map((q, idx) => {
                  const globalNum = countBefore(quad, questions) + idx + 1;
                  return (
                  <div
                    key={q.id}
                    className="flex flex-col gap-3 p-4 hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-base font-bold leading-snug text-slate-800">
                        {globalNum}. {q.text}
                      </p>
                      <p className="mt-1 text-sm italic leading-snug text-slate-500">
                        {q.textEn}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-400">
                        {q.id} · {q.tag}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      {LIKERT.map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          title={`${opt.zh} / ${opt.en}`}
                          onClick={() => onAnswer(q.id, opt.v)}
                          className={`flex h-11 w-11 items-center justify-center rounded-lg border text-sm font-bold transition md:h-12 md:w-12 md:text-base ${
                            answers[q.id] === opt.v
                              ? "scale-105 border-indigo-600 bg-indigo-600 text-white shadow-md"
                              : "border-slate-300 bg-white text-slate-500 hover:border-indigo-300"
                          }`}
                        >
                          {opt.v}
                        </button>
                      ))}
                    </div>
                  </div>
                );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 rounded-xl bg-slate-100 py-4 text-base font-bold text-slate-600"
        >
          上一步 Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg"
        >
          下一步 Next
        </button>
      </div>
    </div>
  );
}
