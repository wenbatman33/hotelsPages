# 專案：預算導向旅遊比價站（MVP）

## 目標
使用者輸入「預算、出發地、日期範圍、天數」，列出預算內能去的目的地，
點擊導向 OTA 售票平台，以聯盟分潤（affiliate）變現。
參考模式：機票小弟 gpbro.com（只參考模式，不得複製其品牌、文案、設計、圖片）。

## 商業模式
- 機票分潤約票價 1–1.6%（引流用）
- 主要利潤來自交叉銷售：住宿（4–7%）、eSIM、Klook / KKday 行程
- 流量來源：programmatic SEO 長尾頁 + IG / Threads
- 營運成本目標：每月 < US$10（靜態站 + 免費 API）

## 技術棧
- Framework：Astro（SSG，SEO 友善）+ TypeScript
- 樣式：Tailwind CSS
- 部署：Cloudflare Pages
- 資料：Travelpayouts Data API（快取價格，非即時）
- 排程：GitHub Actions cron，每 6 小時抓價 → 存 JSON → 觸發 rebuild
- 互動篩選：client-side（預算、天數、直飛、托運）

## 目錄結構
- `scripts/fetch-prices.ts`：抓 API、清洗、輸出 `data/prices.json`
- `scripts/price-labels.ts`：計算「罕見低價 / 價格偏低」標籤
- `src/pages/index.astro`：預算搜尋首頁
- `src/pages/[country]/index.astro`、`src/pages/[country]/[city].astro`：SEO 目的地頁
- `src/pages/holidays.astro`：台灣連假頁
- `src/pages/disclosure.astro`：資料來源與聯盟揭露（必要）
- `src/pages/esim/index.astro`、`src/pages/esim/[country].astro`：eSIM 比價頁
- `src/pages/hotels/index.astro`、`src/pages/[country]/[city]/hotels.astro`：住宿推薦頁（住哪區）
- `src/data/esim.json`：eSIM 方案（手動維護，每月更新）
- `src/data/destinations.json`：國家 / 城市 / 住宿區域
- `src/lib/affiliate.ts`：所有聯盟連結統一由這裡產生

## 住宿 / eSIM 資料規則
- Travelpayouts 的 Hotellook 已於 2025-10-20 關閉，API 停用，不可再用它抓飯店價
- 住宿 MVP 不顯示價格，只做「住哪區＋價位分級＋OTA 深連結」；Agoda 聯盟 API 核准後再加價格
- 住宿主力 Trip.com（cookie 30 天），Agoda cookie 僅 1 天，作為比價選項
- eSIM 無公開比價 API → 手動維護 `src/data/esim.json`，不爬蟲；每筆方案要有 `checkedAt` 查核日
- `verified: false` 的方案前台一律標示「示意價格」，上線前必須改成實際查核過的價格
- 聯盟追蹤 ID 放 `.env`（`TRIPCOM_ALLIANCE_ID`、`TRIPCOM_SID`、`AGODA_CID`、`KLOOK_AID`）；各方案若有聯盟後台產生的連結，直接填 `affiliateUrl` 優先使用
- 所有聯盟連結加 `rel="sponsored nofollow noopener"`，並在連結旁標示「合作連結」

## 部署與 SEO
- 站名「出國吧」（`src/config.ts`），預定正式網域 `chuguoba.tw`（台灣註冊商購買，NS 指向 Cloudflare 後綁成 Worker 自訂網域）
- 部署在 Cloudflare Workers（靜態資源），網址 https://hotelspages.wenbatman33.workers.dev ，push 到 main 自動部署
- `wrangler.jsonc` 的 `name` 必須與後台 Worker 名稱 `hotelspages` 一致；404 靠 `not_found_handling: "404-page"`
- 所有變數（`SITE_URL`、聯盟 ID、`GA_MEASUREMENT_ID`、`GOOGLE_SITE_VERIFICATION`）都在建置時寫進頁面，必須設在 Cloudflare 的「建置變數」，改完要重新部署
- sitemap 由 `@astrojs/sitemap` 產生（`/sitemap-index.xml`），robots.txt 由 `src/pages/robots.txt.ts` 產生
- GA4 合作連結點擊事件：`affiliate_click`（參數 partner、placement、link_domain），來源是連結上的 `data-partner` / `data-placement`

## 編輯推薦飯店
- 寫在 `src/data/destinations.json` 各區域的 `picks` 陣列，每筆：
  `{ "name": "飯店名", "tier": "budget|mid|high", "why": "推薦理由", "sponsored": false, "urls": { "tripcom": "", "agoda": "", "booking": "" } }`
- `urls` 直接貼飯店頁網址，至少一個；`hotelPickLink()` 會去掉日期等參數並加上追蹤 ID
- `sponsored: true`（飯店付費推薦）前台標「廣告」，否則標「編輯推薦」
- 推薦理由需真實，不可捏造入住經驗或抄他人評論
- 資料不完整或網址不是 Trip.com / Agoda / Booking.com 時 build 會直接失敗

## 資料規則
- 只保留台灣可訂的售票平台（過濾俄羅斯、土耳其等平台）
- 價格標示「近 N 天觀測價・非即時」
- 低價標籤：同航線近 60 天各日期組合最低價取中位數；低 25%+ =罕見低價，12–25% =價格偏低；樣本 < 8 不判斷
- API token 放 `.env`（`TRAVELPAYOUTS_TOKEN`、`TRAVELPAYOUTS_MARKER`），絕不 commit

## 開發階段
（2026-10-29 調整：先做 eSIM ＋ 住宿，機票之後再接上）
0a. eSIM 比價頁 + 住宿推薦頁 + 聯盟連結模組 + 揭露頁
0b. 申請聯盟帳號後填入追蹤 ID、把示意價格換成實際價格
1. 骨架：Astro + Tailwind + 部署到 Cloudflare Pages
2. 資料：fetch-prices 腳本 + 假資料 fallback
3. 首頁預算篩選 UI（手機優先）
4. 國家 / 城市 SEO 頁（含 meta、OG、sitemap、JSON-LD）
5. 聯盟連結追蹤（marker 參數）+ 揭露頁
6. GitHub Actions 排程更新
7. 加入住宿 / eSIM 交叉導購

## 開發守則
- 語言：介面文字繁體中文（zh-TW），程式碼與 commit 用英文
- 每階段完成先跑 `npm run build` 確認無誤再進下一步
- 新功能先列計畫給我確認再實作
- 不確定 API 欄位時先寫小腳本實際呼叫確認，不要猜
