# 清華大學足球冬令營 2027 — 報名網站

## 檔案結構

| 檔案 | 用途 |
|------|------|
| `index.html` | 首頁（介紹/課程/教練/收費+退費/FAQ） |
| `signup.html` | 報名頁（表單 + GAS 串接） |
| `gas-backend.js` | Google Apps Script 後端（貼到 Apps Script 編輯器用，不放進 repo 也可以） |

## 部署流程

### 1. 後端（Google Apps Script）
1. 用 stayyoung 新信箱開 Google Sheet，第一列填：`報名時間 | 家長姓名 | 學員姓名 | 電話 | Email | 年級 | 優惠身份 | 午餐 | 狀態`
2. 擴充功能 → Apps Script → 貼上 `gas-backend.js` 內容
3. 改 `CONFIG.SHEET_ID`
4. 部署為網頁應用程式（執行身分：我；存取：所有人）
5. 複製 Web App URL

### 2. 前端
1. `signup.html` 的 `GAS_URL` 換成上面的 URL
2. Push 到 GitHub repo，開啟 GitHub Pages

### 3. 自訂網域（選用）
1. 買網域（如 stayyoung.tw）
2. DNS 加 CNAME 指向 `<username>.github.io`
3. Repo Settings → Pages → Custom domain 填入網域

## 已定案資訊

| 項目 | 內容 |
|------|------|
| 信箱 | stayyoung985@gmail.com（已全站套用） |
| 上課時間 | 09:00–12:00 / 午休 12:00–14:00 / 14:00–17:00，08:30 起報到 |
| 報名截止 | 2027/1/17（日），招不滿可延後 |
| 品牌 | Stay Young（中文名待定，「長青」已棄用） |

## 待填內容（TODO）

| # | 位置 | 內容 |
|---|------|------|
| 1 | index.html 教練區 | 真實教練姓名與簡介 |
| 2 | index.html 課程區 | 真實課表（現為占位內容） |
| 3 | signup.html | GAS_URL |
| 4 | gas-backend.js | SHEET_ID |
| 5 | 全站 | 中文品牌名定案後補上 |
| 6 | 繳費通知信 | 轉帳帳號（發繳費通知前補進 GAS） |

## 候補機制（已內建於 GAS）
- 第 1–25 位：狀態「正取」，寄報名確認信
- 第 26 位起：狀態「候補」，寄候補通知信
- 有人退出時的候補遞補通知（分批寄送每批 5 封）：**手動操作**，之後可加後台功能

## 尚未實作（之後討論）
- ?admin 後台
- 候補遞補自動通知
- 繳費通知批次寄送
