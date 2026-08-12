/** file:// fallback — mirrors data/missions/*.json */
(function (g) {
  if (!g.MissionHubNav) return;
  g.MissionHubNav.setEmbeddedCatalogs(
    {
      tasks: [
        { id: "city_01", title: "社區關懷探訪", description: "每週探訪 2–3 戶社區家庭，陪伴與代禱。", category: "關懷", tags: ["牧养", "怜悯", "探访"], difficulty: 2, hours_per_month: 6 },
        { id: "city_02", title: "長者電話關懷", description: "為獨居長者每週一次電話問安。", category: "關懷", tags: ["怜悯", "服务"], difficulty: 1, hours_per_month: 4 },
        { id: "city_03", title: "課後陪讀支援", description: "協助社區學童課後作業與生命價值分享。", category: "教育", tags: ["教导", "耐心", "儿童"], difficulty: 2, hours_per_month: 8 },
        { id: "city_04", title: "社區食物分享", description: "協助整理、分發食物包給有需要家庭。", category: "社福", tags: ["服务", "怜悯"], difficulty: 2, hours_per_month: 6 },
        { id: "city_05", title: "街市福音派單", description: "在合法區域派發福音單張並簡短問候。", category: "外展", tags: ["传福音", "外展"], difficulty: 3, hours_per_month: 4 },
        { id: "city_06", title: "新移民語言班", description: "協助新來港人士基礎中文/聖經故事班。", category: "外展", tags: ["教导", "服务"], difficulty: 3, hours_per_month: 10 },
        { id: "city_07", title: "單親家庭支持", description: "陪伴單親家庭，提供資源轉介與代禱。", category: "關懷", tags: ["牧养", "怜悯"], difficulty: 3, hours_per_month: 8 },
        { id: "city_08", title: "社區環境清潔日", description: "組織社區清潔，建立教會與社區良好形象。", category: "社福", tags: ["服务", "管理"], difficulty: 1, hours_per_month: 3 },
        { id: "city_09", title: "醫院關懷探訪", description: "在醫院探訪教會會友及未信者家屬（須受訓）。", category: "關懷", tags: ["怜悯", "牧养"], difficulty: 4, hours_per_month: 6 },
        { id: "city_10", title: "青年街頭佈道隊", description: "與青年同工在公共空間音樂/見證外展。", category: "外展", tags: ["传福音", "音乐", "青年"], difficulty: 4, hours_per_month: 8 }
      ]
    },
    {
      tasks: [
        { id: "ind_med_01", title: "醫護職場關懷小組", description: "在同工醫護群體中建立代禱與靈命分享。", industry: "醫護", tags: ["牧养", "怜悯"], difficulty: 3, hours_per_month: 6 },
        { id: "ind_med_02", title: "醫院基督徒團契支援", description: "協助醫院團契資料、講員與活動統籌。", industry: "醫護", tags: ["管理", "服务"], difficulty: 2, hours_per_month: 5 },
        { id: "ind_edu_01", title: "教師職場午餐查經", description: "在學校附近舉辦教師職場查經。", industry: "教育", tags: ["教导", "领导"], difficulty: 2, hours_per_month: 4 },
        { id: "ind_edu_02", title: "校園家長福音茶聚", description: "連結學校家長，以茶聚方式分享福音。", industry: "教育", tags: ["传福音", "服务"], difficulty: 3, hours_per_month: 6 },
        { id: "ind_fin_01", title: "金融同工商查經", description: "為金融從業者提供職場倫理查經。", industry: "金融", tags: ["教导", "管理"], difficulty: 3, hours_per_month: 4 },
        { id: "ind_fin_02", title: "理財誠信見證分享", description: "在教會內分享職場誠信與理財見證。", industry: "金融", tags: ["教导", "服务"], difficulty: 2, hours_per_month: 2 },
        { id: "ind_it_01", title: "教會數位事奉支援", description: "協助教會網站、直播、資料安全基礎維護。", industry: "IT", tags: ["技术", "管理"], difficulty: 2, hours_per_month: 8 },
        { id: "ind_it_02", title: "職場 IT 弟兄禱告群", description: "建立 IT 從業者線上禱告與技術互助群。", industry: "IT", tags: ["服务", "领导"], difficulty: 1, hours_per_month: 3 },
        { id: "ind_soc_01", title: "NGO 合作關懷項目", description: "與社福機構合作，連結教會志工資源。", industry: "社福", tags: ["服务", "怜悯"], difficulty: 3, hours_per_month: 6 },
        { id: "ind_soc_02", title: "社區心理支援轉介", description: "受訓後協助初階傾聽與專業轉介。", industry: "社福", tags: ["辅导", "怜悯"], difficulty: 4, hours_per_month: 6 }
      ]
    }
  );
})(typeof window !== "undefined" ? window : this);
