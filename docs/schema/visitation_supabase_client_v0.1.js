/**
 * visitation_supabase_client_v0.1.js
 * 設計稿：探訪工作桌改用 Supabase `visitations` 表（取代 localStorage）
 * 依據：docs/schema/supabase_church_core_api_v0.1.md
 *
 * 使用方式（未來整合進頁面時）：
 * - 若用 bundler（Vite／webpack）：直接 import 本檔。
 * - 若純 HTML：可改為 <script type="module"> 或將邏輯內嵌並以 CDN 載入 @supabase/supabase-js。
 */

import { createClient } from '@supabase/supabase-js';

// TODO：請替換為你的 Supabase 專案設定（勿將 anon key 提交到公開 repo）
const supabaseUrl = 'https://YOUR-PROJECT.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 讀取某週（含起訖日）的探訪紀錄。
 * @param {{ weekStart: string, weekEnd: string }} opts — ISO 日期字串 'YYYY-MM-DD'
 * @returns {Promise<Array<object>>} visitations 列（失敗時拋錯或依專案改為回傳 { data, error }）
 */
export async function fetchVisitsThisWeek({ weekStart, weekEnd }) {
  const { data, error } = await supabase
    .from('visitations')
    .select('*')
    .gte('visit_date', weekStart)
    .lte('visit_date', weekEnd)
    .eq('is_deleted', false)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('[fetchVisitsThisWeek]', error);
    throw error;
  }
  return data || [];
}

/**
 * 插入一筆探訪紀錄。
 * @param {object} visit — 至少含 member_id, visit_date；可含 visit_type, summary, priority, status, case_id, visitor_member_id, origin, detail_notes, follow_up_action, campus_id, metadata 等
 * @returns {Promise<object|null>} 單筆 insert 結果（.select().single()）
 */
export async function insertVisit(visit) {
  const row = {
    member_id: visit.member_id,
    visit_date: visit.visit_date,
    visit_type: visit.visit_type ?? '一般關懷',
    summary: visit.summary ?? null,
    priority: visit.priority ?? '中',
    status: visit.status ?? 'done',
    case_id: visit.case_id ?? null,
    visitor_member_id: visit.visitor_member_id ?? null,
    origin: visit.origin ?? null,
    detail_notes: visit.detail_notes ?? null,
    follow_up_action: visit.follow_up_action ?? null,
    campus_id: visit.campus_id ?? null,
    metadata: visit.metadata ?? {},
  };

  const { data, error } = await supabase
    .from('visitations')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('[insertVisit]', error);
    throw error;
  }
  return data;
}

/**
 * 軟刪除一筆探訪紀錄（is_deleted = true）。
 * @param {number|string} id — visitations.id
 * @returns {Promise<object|null>}
 */
export async function deleteVisit(id) {
  const { data, error } = await supabase
    .from('visitations')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[deleteVisit]', error);
    throw error;
  }
  return data;
}

/*
 * =============================================================================
 * 頁面整合示意（註解，勿直接執行）
 * =============================================================================
 *
 * // 頁面載入時：計算本週一～週日（或依教會定義），再讀取清單
 * // import { fetchVisitsThisWeek } from './visitation_supabase_client_v0.1.js';
 * // const weekStart = '2026-04-01';
 * // const weekEnd = '2026-04-07';
 * // const visits = await fetchVisitsThisWeek({ weekStart, weekEnd });
 * // renderTableFromSupabase(visits);
 *
 * // 表單送出：在取得 member_id（例如由選單或搜尋 members）後插入
 * // import { insertVisit, fetchVisitsThisWeek } from './visitation_supabase_client_v0.1.js';
 * // await insertVisit({
 * //   member_id: 42,
 * //   visit_date: '2026-04-02',
 * //   visit_type: '病患長者',
 * //   summary: '探訪簡要文字',
 * //   priority: '中',
 * //   status: 'done',
 * //   case_id: null,
 * // });
 * // const visits = await fetchVisitsThisWeek({ weekStart, weekEnd });
 * // renderTableFromSupabase(visits);
 *
 * // 若需軟刪除某列（例如管理功能）
 * // import { deleteVisit } from './visitation_supabase_client_v0.1.js';
 * // await deleteVisit(123);
 */
