import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const CANVAS_SCALE = 2;

function fitImageToPage(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  marginMm: number
): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableW = pageWidth - marginMm * 2;
  const usableH = pageHeight - marginMm * 2;

  const imgData = canvas.toDataURL("image/png");
  const srcW = canvas.width;
  const srcH = canvas.height;

  let drawW = usableW;
  let drawH = (srcH * drawW) / srcW;
  if (drawH > usableH) {
    drawH = usableH;
    drawW = (srcW * drawH) / srcH;
  }

  const x = marginMm + (usableW - drawW) / 2;
  const y = marginMm + (usableH - drawH) / 2;

  pdf.addImage(imgData, "PNG", x, y, drawW, drawH);
}

/**
 * 分段截圖三頁：每個元素一頁 A4，等比縮放置中（避免長圖裁切失真）。
 * 字型已預先在 HTML 中透過 Google Fonts（Noto Sans TC）渲染進點陣圖。
 */
export async function exportReportPdfFromPages(
  pages: HTMLElement[],
  fileName = "Church-Health-Pro-2026-Report.pdf"
): Promise<void> {
  if (pages.length === 0) return;

  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const margin = 10;

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    const el = pages[i]!;
    const canvas = await html2canvas(el, {
      scale: CANVAS_SCALE,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
      scrollX: 0,
      scrollY: -window.scrollY,
    });
    fitImageToPage(pdf, canvas, margin);
  }

  pdf.save(fileName);
}

/** 單頁匯出（相容舊呼叫；仍為單一區塊一頁） */
export async function exportReportPdfFromElement(
  element: HTMLElement,
  fileName?: string
): Promise<void> {
  await exportReportPdfFromPages([element], fileName);
}

export const REPORT_PDF_PAGE_IDS = [
  "chp-report-p1",
  "chp-report-p2",
  "chp-report-p3",
] as const;
