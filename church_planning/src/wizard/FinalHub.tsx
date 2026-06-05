import { useCallback, useState } from "react";
import type { ChurchSize } from "../dimensions";
import { StrategicReportSurface } from "../report/StrategicReportSurface";
import {
  exportReportPdfFromPages,
  REPORT_PDF_PAGE_IDS,
} from "../report/exportReportPdf";
import { RightStrategyBoard } from "../components/RightStrategyBoard";
import { StandardsTab } from "./StandardsTab";
import { AiFollowUpTab } from "./AiFollowUpTab";
import { PdcaHubTab } from "./PdcaHubTab";

type Tab = "report" | "standard" | "ai" | "pdca";

type Props = {
  answers: Record<string, number>;
  churchSize: ChurchSize | null;
  churchName: string;
  reporterRole: string;
  onBackToEdit: () => void;
  /** 網址 `?open=pdca` 時由 App 傳入，直接開 PDCA 分頁 */
  initialTab?: Tab;
};

export function FinalHub({
  answers,
  churchSize,
  churchName,
  reporterRole,
  onBackToEdit,
  initialTab = "report",
}: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [busy, setBusy] = useState(false);

  const onExportPdf = useCallback(async () => {
    const pages = REPORT_PDF_PAGE_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => Boolean(n)
    );
    if (pages.length !== REPORT_PDF_PAGE_IDS.length) return;
    setBusy(true);
    try {
      await exportReportPdfFromPages(pages);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <div className="no-print mb-6 flex flex-wrap gap-1 overflow-x-auto border-b border-slate-300">
        <button
          type="button"
          onClick={() => setTab("report")}
          className={`tab-pill ${tab === "report" ? "tab-pill-active" : ""}`}
        >
          📊 SWOT 診斷報告
        </button>
        <button
          type="button"
          onClick={() => setTab("standard")}
          className={`tab-pill ${tab === "standard" ? "tab-pill-active" : ""}`}
        >
          📖 SWOT 教導原則
        </button>
        <button
          type="button"
          onClick={() => setTab("ai")}
          className={`tab-pill ${tab === "ai" ? "tab-pill-active" : ""}`}
        >
          🤖 Church SWOT AI
        </button>
        <button
          type="button"
          onClick={() => setTab("pdca")}
          className={`tab-pill ${tab === "pdca" ? "tab-pill-active" : ""}`}
        >
          🔁 教會版 PDCA
        </button>
      </div>

      {tab === "report" && (
        <div className="space-y-6">
          <div className="no-print rounded-2xl border border-indigo-200 bg-white p-4 shadow-md">
            <p className="text-base font-bold text-slate-800">
              即時 SWOT 看板 · Live SWOT board
            </p>
            <p className="mt-1 text-sm text-slate-600">
              柱狀圖＋平均線隨作答更新（試用可不答滿 160 題亦可預覽）。
            </p>
            <div className="mt-4 max-h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
              <RightStrategyBoard answers={answers} />
            </div>
          </div>
          <div className="no-print flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={onExportPdf}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-base font-bold text-white shadow disabled:opacity-50"
            >
              {busy ? "匯出中…" : "匯出 PDF（三頁）Export PDF"}
            </button>
            <button
              type="button"
              onClick={onBackToEdit}
              className="rounded-xl bg-slate-200 px-5 py-3 text-base font-bold text-slate-700"
            >
              返回修改 Back to edit
            </button>
          </div>
          <div className="flex justify-center bg-slate-200/50 py-6">
            <StrategicReportSurface
              answers={answers}
              churchSize={churchSize}
              churchName={churchName}
            />
          </div>
        </div>
      )}

      {tab === "standard" && <StandardsTab answers={answers} />}

      {tab === "ai" && (
        <AiFollowUpTab
          answers={answers}
          churchSize={churchSize}
          churchName={churchName}
          reporterRole={reporterRole}
        />
      )}

      {tab === "pdca" && (
        <PdcaHubTab
          answers={answers}
          churchName={churchName}
          onOpenReportTab={() => setTab("report")}
        />
      )}
    </div>
  );
}
