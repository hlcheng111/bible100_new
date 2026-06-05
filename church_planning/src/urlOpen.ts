/** 網址列 `?open=pdca`：直接進總覽並開啟「教會版 PDCA」分頁（靜態入口頁用） */
export function shouldOpenPdcaHub(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("open") === "pdca";
  } catch {
    return false;
  }
}
