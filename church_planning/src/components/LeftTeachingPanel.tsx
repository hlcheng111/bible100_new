import { SPIRITUAL_BY_DIM } from "../data/spiritualContent";
import { DIMENSION_LABELS_ZH, type Dimension } from "../dimensions";
import { dimensionsWhereWeaknessDominates } from "../scoring";

type Props = {
  focusDim: Dimension;
  answers: Record<string, number>;
};

export function LeftTeachingPanel({ focusDim, answers }: Props) {
  const wHighDims = dimensionsWhereWeaknessDominates(answers);
  const focus = SPIRITUAL_BY_DIM[focusDim];

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto border-r border-slate-800/80 bg-slate-900/40 p-5">
      <header>
        <p className="font-serif text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
          屬靈教導區
        </p>
        <h2 className="mt-1 font-serif text-lg font-semibold text-slate-100">
          與「{DIMENSION_LABELS_ZH[focusDim]}」相關的牧養視角
        </h2>
      </header>

      {wHighDims.length > 0 && (
        <div
          className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-4 shadow-lg shadow-rose-900/20"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-300">
            病徵診斷（W 均分 &gt; S 均分）
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-rose-50/95">
            {wHighDims.map((d) => (
              <li key={d}>
                <span className="font-semibold text-rose-200">
                  {DIMENSION_LABELS_ZH[d]}
                </span>
                <p className="mt-1 text-rose-100/90">
                  {SPIRITUAL_BY_DIM[d].symptomWhenWHigh}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold text-emerald-200">聖經原則</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {focus.principle}
        </p>
      </section>

      <section className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold text-amber-200/90">牧養提醒</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {focus.reminder}
        </p>
      </section>
    </aside>
  );
}
