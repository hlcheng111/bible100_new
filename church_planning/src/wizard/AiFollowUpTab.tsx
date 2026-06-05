import {
  CHURCH_SIZE_LABELS,
  CHURCH_SIZE_LABELS_EN,
  DIMENSION_LABELS_ZH,
  type ChurchSize,
} from "../dimensions";
import { computePeaceIndex } from "../analytics/peaceIndex";
import {
  primaryBurdenDimension,
  primaryStrengthDimension,
} from "../analytics/strategicReport";
import { weightedDimQuadAverage } from "../analytics/weighted";
import { CHURCH_HEALTH_QUESTIONS } from "../data/churchHealthQuestions";

type Props = {
  answers: Record<string, number>;
  churchSize: ChurchSize | null;
  churchName: string;
  reporterRole: string;
};

const BANK = CHURCH_HEALTH_QUESTIONS;

const AI_PLATFORMS_INTL = [
  {
    name: "ChatGPT",
    subtitle: "OpenAI",
    desc: "邏輯與結構強，適合制定複雜的 6 個月轉型計畫與行政架構重組。",
    url: "https://chat.openai.com",
  },
  {
    name: "Claude",
    subtitle: "Anthropic",
    desc: "文筆細膩且具同理心，適合撰寫牧函、家書或同工鼓勵信。",
    url: "https://claude.ai",
  },
  {
    name: "Gemini",
    subtitle: "Google",
    desc: "聯網與檢索能力佳，可輔助查閱教會所在社區的公開統計或趨勢（請自行核實來源）。",
    url: "https://gemini.google.com",
  },
] as const;

const AI_PLATFORMS_ZH = [
  {
    name: "Kimi 智能助手",
    subtitle: "月之暗面",
    desc: "擅長長文本，可上傳整份報告並總結關鍵痛點；適合中文長文梳理。",
    url: "https://kimi.ai",
  },
  {
    name: "通義千問（Qwen）",
    subtitle: "阿里雲",
    desc: "對中華文化與在地社會脈絡理解較深，適合設計社區福音外展與本地化策略草案。",
    url: "https://tongyi.aliyun.com",
  },
  {
    name: "智譜清言（ChatGLM）",
    subtitle: "智譜 AI",
    desc: "邏輯推演清楚，適合把診斷結果轉成可追蹤的 SMART 目標與檢核表草稿。",
    url: "https://chatglm.cn",
  },
] as const;

const AI_FOLLOW_UP_PROMPTS = [
  {
    label: "SWOT 矛盾分析",
    prompt:
      "「我們完成教會十維 SWOT 問卷：請看柱狀圖上『高於平均』與『低於平均』的維度各有哪些。為什麼內部 S 強的維度，卻可能在另一維度出現 W 偏高？請用 SWOT 語言條列可能結構原因與可驗證假設。」",
  },
  {
    label: "預算 × TOWS 槓桿",
    prompt:
      "「若明年只有 5 萬元專案預算，請依我們觸發的 TOWS 類型（SO／WO／ST／WT），建議錢先投在哪一交叉策略最能以點帶面？請給理由與分階段運用。」",
  },
  {
    label: "溝通話術（調整事工）",
    prompt:
      "「我要向會眾說明：依 SWOT 診斷需暫停或調整部分聚會與事工。請草擬一封溫暖但堅定的牧長家書（約 500 字），含同理、異象連結、SWOT 一句話摘要與下一步邀請。」",
  },
] as const;

function avgLikert(answers: Record<string, number>): number | null {
  const v = Object.values(answers);
  if (v.length === 0) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

/** 與原型「總分」同向：填答越高分越好，換算約 0–50 參考值 */
function overallPseudo50(answers: Record<string, number>): string {
  const m = avgLikert(answers);
  if (m === null) return "—";
  return ((m / 4) * 50).toFixed(1);
}

/** 壓力維度「健康分」：越低越需關注（對齊原型危機區低分語感） */
function worstDimHealthPseudo50(answers: Record<string, number>): string {
  const dim = primaryBurdenDimension(answers);
  if (!dim) return "—";
  const w = weightedDimQuadAverage(dim, "W", BANK, answers);
  const t = weightedDimQuadAverage(dim, "T", BANK, answers);
  const parts = [w, t].filter((x): x is number => x !== null);
  if (parts.length === 0) return "—";
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
  const health = (1 - avg / 4) * 50;
  return health.toFixed(1);
}

function strengthDimHealthPseudo50(answers: Record<string, number>): string {
  const dim = primaryStrengthDimension(answers);
  if (!dim) return "—";
  const s = weightedDimQuadAverage(dim, "S", BANK, answers);
  if (s === null) return "—";
  return ((s / 4) * 50).toFixed(1);
}

export function AiFollowUpTab({
  answers,
  churchSize,
  churchName,
  reporterRole,
}: Props) {
  const worst = primaryBurdenDimension(answers);
  const best = primaryStrengthDimension(answers);
  const worstZh = worst ? DIMENSION_LABELS_ZH[worst] : "（請依報告填最弱維度）";
  const bestZh = best ? DIMENSION_LABELS_ZH[best] : "（請依報告填強項維度）";
  const peace = computePeaceIndex(answers);
  const sizeZh = churchSize ? CHURCH_SIZE_LABELS[churchSize] : "未定";
  const sizeEn = churchSize ? CHURCH_SIZE_LABELS_EN[churchSize] : "n/a";
  const overallScore = overallPseudo50(answers);
  const worstScore = worstDimHealthPseudo50(answers);
  const bestScoreHint = strengthDimHealthPseudo50(answers);
  const roleTrim = reporterRole.trim();
  const answered = Object.keys(answers).length;
  const total = CHURCH_HEALTH_QUESTIONS.length;

  const aiExamples = [
    {
      title: "例題 A：針對「危險區域」開發轉型計畫（最短木板）",
      content: `「請扮演一位具備 [ 請填：年資，如 20 年 ] 經驗的教會增長顧問。我所在的教會位於 [ 請填：地區，如台北市鬧區 ]，規模約 [ 請填：人數，如 100 人 ]，會友主要是 [ 請填：會友組合，如年輕雙薪家庭 ]。

根據剛完成的診斷報告，我們在 [ 請填：最弱範疇名稱，如 ${worstZh} ] 得分最低，只有 [ 請填：分數，如 ${worstScore} 分 ]，屬於 [ 請填：區間，如危機區 ]。主要問題是 [ 請填：一句話描述現況，如聚會流於形式、缺乏生命敞開 ]。

請依教會 SWOT／TOWS 思維（先整固內部 W，再對接外部 O／T），為我們提供一份為期 [ 請填：月數，如 6 個月 ] 的 [ 請填：行動主題，如小組活化行動清單 ]。我需要具體到每個月的主題，以及如何評估進度。」`,
    },
    {
      title: "例題 B：將「SWOT 教導原則」轉化為同工培訓",
      content: `「我現在擔任 [ 教會長老 ]。我想用報告附錄的 [ 『SWOT 教導原則』十維卡片 ] 來培訓 [ 執事團隊 ]，幫他們學會讀柱狀圖與 S／W／O／T 四象限。

我們在 [ 請填維度，如領導力 ] 的柱狀參考分約 [ 請填分數 ]，W̄ 相對偏高。請為我設計一份 [ 請填：時長，如 45 分鐘 ] 的 [ 同工工作坊大綱 ]。

大綱需含：[ 請填：數量，如 3 個 ] 分組討論題（要用 SWOT 語言）、[ 請填：數量，如 1 個 ] 實作練習（主題：[ 請填，如授權與界線 ]），以及結束禱告方向。」`,
    },
    {
      title: "例題 C：SO 策略—用內部 S 接住外部 O",
      content: `「請扮演資深牧養導師。我們內部 S 較明顯的維度是 [ 請填：如 ${bestZh} ]（柱狀參考分約 ${bestScoreHint}），內部 W 較需關注的是 [ 請填：如 ${worstZh} ]（約 ${worstScore}）。

社區外部機會 O：周邊有許多 [ 請填：對象，如外籍移工與獨居老人 ]。請腦力激盪 [ 請填：數量，如 5 個 ] 條 **SO 策略**（優勢×機會），並標註要避開的 **WT 陷阱**（別讓弱點被外部威脅放大）。」`,
    },
  ];

  return (
    <div className="ai-tab-root rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-9">
      <h2 className="mb-5 border-b-2 border-indigo-500 pb-3 font-black text-indigo-700">
        🤖 Church SWOT AI · 戰略跟進{" "}
        <span className="text-sm font-semibold text-slate-500">
          (SWOT / TOWS prompts)
        </span>
      </h2>
      <div className="ai-lead-box mb-10">
        這份輸出是<strong>教會 SWOT 快照</strong>：柱狀＋四象限＋TOWS
        規則。下一步是把資料變成<strong>可執行方案</strong>——建議用 ChatGPT／Claude／Kimi／Gemini
        當<b>虛擬戰略同工</b>，但本頁不代您送題；請自行複製提示語。
        <span className="mt-2 block text-sm font-normal text-slate-600">
          （試用：已答 {answered}/{total} 題 · PeaceIndex 約 {peace.value.toFixed(2)} ·
          教會：{churchName || "（未填）"}）
        </span>
      </div>

      <section className="mb-10">
        <h3 className="mb-2 flex items-center gap-2 font-black text-indigo-900">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
            1
          </span>
          第一步：推薦 AI 平台 (Recommended Platforms)
        </h3>
        <p className="mb-5 ml-9 text-sm leading-snug text-slate-600">
          以下為<strong>國際 3 款</strong>與<strong>中文 3 款</strong>，附說明與官方連結（請依各平台條款與合規使用）。
        </p>

        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-[#0b5fa5]">▸</span> 國際頂尖（英文／多語）
        </h4>
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {AI_PLATFORMS_INTL.map((ai) => (
            <div
              key={ai.url}
              className="ai-card flex flex-col justify-between"
            >
              <div>
                <p className="mb-0.5 text-base font-bold text-indigo-700">
                  {ai.name}{" "}
                  <span className="text-xs font-semibold text-slate-500">
                    {ai.subtitle}
                  </span>
                </p>
                <p className="mb-3 text-sm leading-snug text-slate-600">{ai.desc}</p>
              </div>
              <a
                href={ai.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-slate-800 px-4 py-2 text-center text-xs font-bold text-white transition hover:bg-indigo-600"
              >
                前往平台 ➔
              </a>
            </div>
          ))}
        </div>

        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-[#0b5fa5]">▸</span> 中文首選（長文本／在地脈絡）
        </h4>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {AI_PLATFORMS_ZH.map((ai) => (
            <div
              key={ai.url}
              className="ai-card flex flex-col justify-between"
            >
              <div>
                <p className="mb-0.5 text-base font-bold text-indigo-700">
                  {ai.name}{" "}
                  <span className="text-xs font-semibold text-slate-500">
                    {ai.subtitle}
                  </span>
                </p>
                <p className="mb-3 text-sm leading-snug text-slate-600">{ai.desc}</p>
              </div>
              <a
                href={ai.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-slate-800 px-4 py-2 text-center text-xs font-bold text-white transition hover:bg-indigo-600"
              >
                前往平台 ➔
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="mb-2 flex items-center gap-2 font-black text-indigo-900">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
            2
          </span>
          第二步：萬用 AI 提示語公式 (P-C-D-O)
        </h3>
        <div className="ai-pcdo-intro">
          為了獲得最精準的行動方案，請用 <b>P-C-D-O</b> 四要素組合提示語：
          <b>角色 (Persona)</b>、<b>背景 (Context)</b>、<b>數據 (Data)</b>、
          <b>輸出 (Output)</b>。
        </div>
        <div className="rounded-2xl border-2 border-dashed border-[#90caf9] bg-slate-50/90 p-6 md:p-7">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="ai-pcdo-cell rounded-lg p-3">
              <b className="text-[#0b5fa5]">角色 (P):</b>
              <br />
              賦予專業身份
            </div>
            <div className="ai-pcdo-cell rounded-lg p-3">
              <b className="text-[#0b5fa5]">背景 (C):</b>
              <br />
              規模、地點、會友組成
            </div>
            <div className="ai-pcdo-cell rounded-lg p-3">
              <b className="text-[#0b5fa5]">數據 (D):</b>
              <br />
              柱狀分、S／W／O／T、TOWS
            </div>
            <div className="ai-pcdo-cell rounded-lg p-3">
              <b className="text-[#0b5fa5]">輸出 (O):</b>
              <br />
              清單／大綱／時間軸等格式
            </div>
          </div>
          <div className="ai-prompt-demo mt-5 select-all">
            <p className="mb-3 text-sm font-bold tracking-wide text-slate-600">
              萬用公式示範（分段如下；數字由本系統帶入，可分段複製或全選）
            </p>
            <p className="mb-2 font-serif text-sm text-slate-500">「</p>
            <p className="ai-prompt-line">
              <span className="ai-prompt-tag">(P)</span>
              請扮演專業教會 SWOT／TOWS 策劃顧問（熟悉信仰群體治理）。
            </p>
            <p className="ai-prompt-line">
              <span className="ai-prompt-tag">(D)</span>
              我們完成十維 SWOT 問卷（每維 S／W／O／T 四象限）：綜合柱狀參考分約 {overallScore}
              （0–50）；內部壓力較集中於【{worstZh}】，該維度「健康參考分」約 {worstScore}
              （越低越需整固）；優勢訊號可先看【{bestZh}】。PeaceIndex 約 {peace.value.toFixed(2)}。
            </p>
            <p className="ai-prompt-line">
              <span className="ai-prompt-tag">(C)</span>
              教會簡稱：{churchName || "（未填）"}；規模：{sizeZh}（{sizeEn}
              ）；填寫人職分是{" "}
              {roleTrim ? (
                roleTrim
              ) : (
                <span className="ai-ph">[ 請填寫 ]</span>
              )}
              。
            </p>
            <p className="ai-prompt-line">
              <span className="ai-prompt-tag">(O)</span>
              請基於 SWOT 盤點與 TOWS 交叉，為我們提供為期 6 個月的轉型行動方案（含停做／必做取捨）。
            </p>
            <p className="mt-2 font-serif text-sm text-slate-500">」</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="mb-2 flex items-center gap-2 font-black text-indigo-900">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
            3
          </span>
          第三步：深度追問具體例題（直接複製修改）
        </h3>
        <p className="mb-3 ml-9 text-sm leading-snug text-slate-600">
          請把 <strong>[ … ]</strong> 內改成您的實況（可保留範例字，也可整段改寫）。方括號代表「這裡要換成你的關鍵資訊」；本頁職分若未填，萬用公式處會顯示{" "}
          <span className="ai-ph px-1.5 py-0.5 align-middle text-xs">[ 請填寫 ]</span>
          。
        </p>
        <div className="space-y-4">
          {aiExamples.map((ex) => (
            <div
              key={ex.title}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <h4 className="ai-ex-title">{ex.title}</h4>
              <p className="mb-1.5 text-sm font-bold text-slate-600">提示語</p>
              <div className="ai-ex-box select-all whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 font-medium text-slate-800 shadow-sm">
                {ex.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h3 className="mb-2 flex items-center gap-2 font-black text-indigo-900">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
            4
          </span>
          第四步：萬用提問清單（更多追問技巧）
        </h3>
        <p className="mb-4 ml-9 text-sm leading-snug text-slate-600">
          想進一步挖掘報告價值，可嘗試以下問法（整段複製到 AI 即可）。
        </p>
        <div className="space-y-3">
          {AI_FOLLOW_UP_PROMPTS.map((tip) => (
            <div key={tip.label} className="ai-follow-card">
              <div className="ai-follow-card-h">{tip.label}</div>
              <div className="ai-follow-card-body select-all whitespace-pre-wrap">
                {tip.prompt}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
