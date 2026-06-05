-- =============================================================================
-- supabase_visitations_policies_demo.sql
-- visitations 表：從「只讀 demo」切換為「已登入使用者可讀可寫」時使用
-- =============================================================================
--
-- 前置：`public.visitations` 已建立且已啟用 RLS（ENABLE ROW LEVEL SECURITY）。
--
-- 使用方式：
--   1. 在 Supabase Console → SQL Editor 貼上本檔內容並執行。
--   2. 前端請使用「已登入」後的 Supabase client（具 authenticated JWT），
--      若仍只用 anon key，則需另設 policy（例如僅限私有 demo 專案才可對 anon 開 insert/select）。
--
-- 說明：
--   · 第一條 policy：允許已登入使用者 SELECT 全部 visitations，供「本週清單」讀取。
--     參考：https://supabase.com/docs/guides/database/postgres/row-level-security
--   · 第二條 policy：允許已登入使用者 INSERT（demo 期不綁 auth.uid，with check (true)）。
--
-- 非 demo 時請改嚴：例如限制同一教會、或僅允許 visitor_member_id = 當前 user 對應之 member 等，
-- 將第二條的 with check 改為對應條件即可。
--
-- 若 policy 已存在且名稱衝突，請先 drop 或改用不同 policy 名稱。
-- =============================================================================

-- 1. 允許已登入使用者讀取所有訪視紀錄（demo 用）
create policy "訪視清單可供登入使用者查看"
on public.visitations
for select
to authenticated
using ( true );

-- 2. 允許已登入使用者新增訪視紀錄（未做 user 綁定，demo 期簡化）
create policy "登入使用者可以新增訪視紀錄（demo）"
on public.visitations
for insert
to authenticated
with check ( true );
