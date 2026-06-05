# 全站 Landing／模組入口 UX 原則（2026 草案）

**狀態**：原則已定；各模組可**分階段**落地。搜尋頁面內 **`TODO: 圖解建議：`** 可找到已標註、待補資訊圖的位置。

**相關實作紀錄**：

- 智慧事奉：`smart_ministry/landing.html`、`smart_ministry/index.html`、`smart_ministry/guide_for_leaders.html`、`smart_ministry/talent_skill_unified.html`、`smart_ministry/matching.html` 等。
- 教會規劃：`church_planning/church-planning-index.html`、`church_planning/index_plan.html`、`church_planning/planning-user-guide.html`。
- 資料與重修脈絡：`smart_ministry/docs/RENOVATION_PLAN.md`。

---

## 一、核心目標

- **小白敢用**：進頁 10 秒內知道「先做哪一步、點哪裡」。
- **路線清楚**：個人動線（註冊→問卷→跟進）與領袖動線（盤點→配對→會議決策）分開標示，必要時分欄或分區。
- **圖文並茂（漸進）**：先以步驟卡、進度條、示意卡與 **HTML 註解／`text/plain` 備份** 承載 wireframe；**不**強求首輪即上線 Mermaid 渲染或完整 SVG。
- **不影響邏輯**：本原則優先適用**前端敘事與導覽**；不改 scoring、後端或資料契約，除非另開任務。

---

## 二、每個模組 Landing 建議具備的元素

| 元素 | 說明 |
|------|------|
| **快速開始** | 主標題下或折疊上方：1～3 步，每步一個主 CTA（連到真實頁面）。 |
| **角色分區** | 「給會友／成員」vs「給牧者／同工／行政」入口分開；避免長文混雜。 |
| **建設中標示** | 未完成或僅示意之功能區，用明顯提示管理期待，必要時附**靜態示意卡**（標註為範例）。 |
| **跨模組連結** | 與相依模組（如教會規劃 ↔ 智慧事奉）用**一句話敘事**+ 雙向連結，避免只有單向 URL。 |
| **領袖指南** | 治理、權限、隱私、流程；可獨立成頁，從模組首頁與 landing 連入。 |
| **圖解預留** | 統一使用 `<!-- TODO: 圖解建議：…… -->`；複雜流程可另用 `<script type="text/plain" id="...">` 存 Mermaid 備份（**勿**含可執行 JS）。 |

### 進階自我認識工具（MBTI 簡化／DISC／SHAPE）

- **主線**仍是註冊 + 屬靈恩賜測驗；此三項為**選用**，不作服事門檻。  
- **設計原則與 Cursor 約束**：`smart_ministry/docs/ADVANCED_SELF_KNOWLEDGE_TOOLS.md`。

---

## 三、待套用模組清單（之後逐個實作）

下列模組尚未全面套用本檔所列 UI 元素時，以本清單為排程參考（與 `docs/TOOLS_AND_ENTRY_REFERENCE.md` 入口並讀）：

| 模組 | 建議優先 Landing／入口 |
|------|-------------------------|
| 門訓動力站 | `disciple_dynamics/` 首頁或 dashboard |
| 教會事工 | `church_ministry/dashboard.html`、相關 landing |
| 學校管理 | `school_management/` 入口 |
| 聖經研讀 | `bible_study/dashboard.html` 或主 landing |
| 會眾入口 | `church_ministry/congregation/index.html` |
| Q&A 系列 | 各 `qna/*_index.htm` landing |
| 詩歌管理 | `hymn_management/index.html` |

**驗收**：該模組至少具「快速開始」或同等導引、主要角色可辨識、並在適當處有至少一則 `TODO: 圖解建議` 或已定稿之圖。

---

## 四、與教會規劃的協同敘事（摘要）

- **教會規劃**：堂會層異象、調查、策略與年度節奏。
- **智慧事奉**：會友恩賜／技能盤點、同工維護、配對建議與成長追蹤。

銜接句建議沿用兩模組 landing／指南中的用語，並以 **`docs/FIVE_STAGES_SIDEBAR_DRAFT.md`**（若存在且為準）為五階敘事單一來源，避免兩邊流程描述分歧。

---

*建立：2026-04 · 與 Smart Ministry／Church Planning 本輪 landing 改良一併掛號。*
