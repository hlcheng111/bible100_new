import type { ChurchSize } from "../dimensions";
import {
  CHURCH_SIZE_LABELS,
  CHURCH_SIZE_LABELS_EN,
} from "../dimensions";

type Props = {
  churchName: string;
  onChurchName: (v: string) => void;
  reporterRole: string;
  onReporterRole: (v: string) => void;
  churchSize: ChurchSize | null;
  onChurchSize: (s: ChurchSize) => void;
  onStart: () => void;
};

export function ProfileStep({
  churchName,
  onChurchName,
  reporterRole,
  onReporterRole,
  churchSize,
  onChurchSize,
  onStart,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl md:p-10">
      <h2 className="border-b border-slate-200 pb-4 text-2xl font-bold italic text-indigo-600">
        教會背景調查{" "}
        <span className="text-lg font-semibold not-italic text-slate-500">
          | Church Profile
        </span>
      </h2>
      <p className="mt-3 text-base leading-relaxed text-slate-600">
        選填背景有助報告與 AI 萬用公式（P-C-D-O）的「背景」欄。試用階段無需登入；資料僅存本機。
      </p>
      <div className="mt-8 grid gap-5 text-base">
        <div>
          <label className="block font-bold text-slate-800">
            填寫人職分 Role of respondent（選填）
          </label>
          <input
            type="text"
            value={reporterRole}
            onChange={(e) => onReporterRole(e.target.value)}
            placeholder="例：牧師、長老、行政同工"
            className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base shadow-sm outline-none ring-indigo-300 focus:ring-2"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-800">
            教會簡稱 Church name (optional)
          </label>
          <input
            type="text"
            value={churchName}
            onChange={(e) => onChurchName(e.target.value)}
            placeholder="例：某某教會"
            className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base shadow-sm outline-none ring-indigo-300 focus:ring-2"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-800">
            規模等級 Size category
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(CHURCH_SIZE_LABELS) as ChurchSize[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => onChurchSize(k)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition md:text-base ${
                  churchSize === k
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
                }`}
              >
                <span className="block font-semibold">{CHURCH_SIZE_LABELS[k]}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {CHURCH_SIZE_LABELS_EN[k]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-10 w-full rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-700"
      >
        開始診斷 Start diagnosis
      </button>
    </div>
  );
}
