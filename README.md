# 清華大學足球冬令營 2027 — 報名網站

https://nthu-football.stayyounglab.com ｜ 隸屬 [Stay Young](https://stayyounglab.com)（[主站 repo](https://github.com/Ryan1109-d/stay-young-home)）

與羽球營（badminton-camp）為**完全獨立**的專案：獨立 repo、獨立 Apps Script、獨立 Google Sheet。

## 檔案結構

| 檔案 | 用途 |
|---|---|
| `index.html` | 首頁（介紹／課程／教練／收費＋退費／FAQ／場地） |
| `signup.html` | 報名頁（7 張分段卡片式表單 + GAS 串接，`GAS_URL` 在檔案內） |
| `gas-backend.js` | Apps Script 後端原始碼（納入版控供稽核用，實際執行的是 Apps Script 上那份） |
| `images/` | Hero、場地、教練照 |
| `robots.txt`、`sitemap.xml` | SEO |
| `CNAME` | GitHub Pages 自訂網域，**請勿刪除** |

## 營隊事實

| 項目 | 內容 |
|---|---|
| 日期 | 2027/1/25（一）– 1/29（五），單梯 |
| 時段 | 僅整天 09:00–17:00（12:00–14:00 午休） |
| 彈性接送 | 最早 08:00 送達、最晚 18:00 接回（首屏、特色卡、FAQ 皆有說明）|
| 對象 | 國小 3–6 年級（報名表年級選項含「其他」） |
| 地點 | 清華大學南大校區 體健大樓五樓室內＋室外操場 |
| 價格 | 原價 **$8,500**／單一優惠 **$8,000**／兩種優惠疊加 **$7,500** |
| 優惠身份 | 早鳥（**11/20** 前）／團報 5 人／清大教職員，**三擇一，彼此不可疊加**，減 $500 |
| 推薦人優惠 | 報名表填推薦人姓名，**可與優惠身份疊加**，再減 $500。繳費單上直接折抵 |
| 名額 | 正取 25 人（`CONFIG.CAPACITY`），第 26 位起自動候補 |
| 開班門檻 | 12 人。未達門檻不寄繳費通知、不收任何費用 |
| 報名截止 | 2027/1/10（日） |
| 繳費期限 | 收到繳費通知後 7 天（`PAYMENT.DEADLINE_DAYS`） |
| 聯絡 | stayyoung985@gmail.com ／ 0979-032-572 |

**退費**：開課 15 天前全額｜前 6–14 天 90%｜前 5 天內 70%｜開課後不退。

**午餐費 500 元不併入轉帳金額** —— 開課第一天直接交給教練，繳費通知信會另起一行說明。

## 後端部署（Google Apps Script）

1. Google Sheet 建立分頁 `報名名單`，第一列填**這 26 欄**，順序不能動（程式按位置寫入）：

   ```
   報名時間 | 梯次 | 學員姓名 | 性別 | 年齡 | 年級 | 收信信箱 | 緊急聯絡人 | 緊急聯絡人電話 |
   繳款人姓名 | 繳款人電話 | 繳款人信箱 | 優惠身份 | 推薦人 | 午餐 | 狀態 | 團報成員 | 衣服尺寸 |
   備註 | 照片同意 | 健康狀況 | 健康說明 | 緊急醫療授權 | 法定代理人聲明 | 繳費通知 | 系統訊息
   ```

   > ⚠️ 第 14 欄「推薦人」是 2026-08-17 新增的。若 Sheet 已有報名資料，
   > 請用「插入 1 欄」而不是直接改標題，否則其後的既有資料會全部錯位。

2. 擴充功能 → Apps Script → 貼上 `gas-backend.js`
3. 填 `CONFIG.SHEET_ID`（repo 內是 `YOUR_SHEET_ID_HERE` 佔位字串，真值只填在 Apps Script）
4. 部署為網頁應用程式（執行身分：我；存取權：所有人），複製 Web App URL 填進 `signup.html` 的 `GAS_URL`
5. 函式下拉選 `installDailyBackupTrigger` → 執行，裝每日 23:00–00:00 備份。重複執行不會裝出兩個；`listTriggers` 可隨時查看

> ⚠️ **重貼原始碼前先複製 Apps Script 上現有的 `SHEET_ID` 與 `PAYMENT.ACCOUNT_NAME`**。repo 這份兩者都是佔位字串，直接覆蓋會清掉設定，繳費通知會被防呆擋住。

## 主要函式

| 函式 | 作用 |
|---|---|
| `doPost` | 接收報名，寫入 Sheet、判定正取／候補、寄確認信 |
| `sendConfirmEmail` / `sendWaitlistEmail` | 報名確認信／候補通知信 |
| `notifyOwner_` | 每筆新報名寄一封通知到 stayyoung985，主旨帶【足球】以免與羽球混淆。寄失敗不影響報名 |
| `calcAmount` / `buildPaymentBody` | 依報名時間、優惠身份與推薦人算金額、組繳費通知內容。**推薦人不自動查證**，只看欄位有沒有填；查證不成立時把 Sheet 該格清成「—」再重跑即可 |
| `previewPaymentNotice` | **預覽**繳費通知（不寄出），上線前先跑這個 |
| `sendPaymentNotice` | 寄繳費通知 |
| `sendCancelNotice` | 取消通知 |
| `paymentIsPlaceholder` | 戶名還是佔位字串時擋住所有繳費通知 |
| `installDailyBackupTrigger` / `listTriggers` / `dailyBackup` | 每日備份（只留最近 14 份） |

## 安全機制

`safeCell`（Sheet 公式注入防護，`=` 開頭前置單引號）｜`safeText`（信件標頭注入防護）｜`LockService` 併發鎖｜honeypot 欄位｜重複報名檢查｜名額計數只算「正取」｜寄信失敗改寫入「系統訊息」欄，不回傳錯誤給前端｜錯誤訊息不原樣外洩

## 待處理

| 位置 | 內容 |
|---|---|
| `index.html` | 仍掛 `noindex`，公開招生前要移除 |
| Apps Script | repo 內的 `gas-backend.js` 已改為三層定價，但**尚未貼回 Apps Script**。在貼上之前，線上實際計價仍是舊價 |
| 全站 | 未提及保險。若有投保責任險，需補上說明 |
| 花絮區 | 已移除，等真實活動照再加回 |

`images/venue-field.jpg` 是真實場地照；hero 圖為圖庫／AI 素材，**不可標示為實拍**。

**逾期未繳的候補遞補是人工作業**，程式不會自動處理。

## 部署

GitHub Pages（`master` / root）。push 後約 1–3 分鐘生效，用 curl 輪詢驗證。修改前先 `git pull`。
