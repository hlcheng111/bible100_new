import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Chrome／Edge 對 file:// 的 ES module 預設會擋（畫面全白）。
 * 移除 crossorigin 可讓部分環境較寬鬆；仍建議用本機 http（preview 或附帶 .cmd）。
 */
function stripCrossoriginForFileProtocol(): import("vite").Plugin {
  return {
    name: "strip-crossorigin-file-friendly",
    enforce: "post",
    transformIndexHtml(html) {
      return html.replace(/\s+crossorigin(?:="[^"]*")?/gi, "");
    },
  };
}

/** 相對路徑 base：適合掛在子目錄或以 http 提供 dist */
export default defineConfig({
  plugins: [react(), stripCrossoriginForFileProtocol()],
  base: "./",
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  build: {
    rollupOptions: {
      output: {
        /** 單一 JS chunk，避免 file:// 下動態 import 第二個檔案再失敗（仍建議用 http） */
        inlineDynamicImports: true,
      },
    },
  },
});
