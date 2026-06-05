import { DIMENSIONS, DIMENSION_LABELS_EN, DIMENSION_LABELS_ZH } from "../dimensions";
import { SPIRITUAL_BY_DIM } from "../data/spiritualContent";
import { dimensionsWhereWeaknessDominates } from "../scoring";
import type { Dimension } from "../dimensions";

type Props = {
  answers: Record<string, number>;
};

/** 教會 SWOT 教導：聖經原則＋各維度 SWOT 讀法 */
export function StandardsTab({ answers }: Props) {
  const wHigh = new Set(dimensionsWhereWeaknessDominates(answers));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-10">
      <h2 className="mb-4 border-b-4 border-emerald-500 pb-3 text-2xl font-black text-slate-900">
        📖 SWOT 教導原則{" "}
        <span className="text-lg font-semibold text-slate-500">
          | Standards for church SWOT
        </span>
      </h2>
      <div className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 text-sm leading-relaxed text-slate-800">
        <p className="font-bold text-indigo-900">為何改以 SWOT 語言？</p>
        <p className="mt-2">
          本模組與長期計劃第二階段的 SWOT／目標／看板同一條戰略軸線：
          <strong>S</strong> 內部可放大的資產、<strong>W</strong> 內部消耗與破口、
          <strong>O</strong> 外部時機與鄰舍需要、<strong>T</strong> 外部壓力與限制。
          問卷四象限（S／W／O／T）可直接餵給 TOWS 交叉與優先序，不在此重複 NCD
          八大特質用語，以免與「教會健康」商業框架混淆。
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {DIMENSIONS.map((d: Dimension) => {
          const c = SPIRITUAL_BY_DIM[d];
          const flag = wHigh.has(d);
          return (
            <div
              key={d}
              className={`rounded-2xl border-l-4 p-5 text-base leading-relaxed ${
                flag
                  ? "border-rose-400 bg-rose-50/80"
                  : "border-emerald-400 bg-slate-50"
              }`}
            >
              <p className="text-lg font-black text-slate-900">
                {DIMENSION_LABELS_ZH[d]}{" "}
                <span className="text-sm font-normal text-slate-500">
                  ({DIMENSION_LABELS_EN[d]})
                </span>
              </p>
              {flag && (
                <p className="mt-2 text-sm font-bold text-rose-700">
                  SWOT 提示：此維度 W̄ 高於 S̄（內部劣勢訊號較強）· 宜先整固再談擴張
                </p>
              )}
              <p className="mt-3 font-bold text-sky-900">SWOT 讀法（此維度）</p>
              <p className="text-slate-800">{c.swotLens}</p>
              <p className="mt-3 font-bold text-emerald-800">
                聖經原則 Scripture principle
              </p>
              <p className="text-slate-800">{c.principle}</p>
              <p className="mt-3 font-bold text-amber-800">
                牧養提醒 Pastoral reminder
              </p>
              <p className="text-slate-700">{c.reminder}</p>
              <p className="mt-3 font-bold text-rose-800">
                當 W 訊號偏強時 When weakness dominates
              </p>
              <p className="text-slate-700">{c.symptomWhenWHigh}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
