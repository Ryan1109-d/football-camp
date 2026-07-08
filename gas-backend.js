/**
 * 清華大學足球冬令營 2027 — Google Apps Script 後端
 *
 * 部署步驟：
 * 1. 用 stayyoung 新信箱開一個 Google Sheet，第一列填欄位標題：
 *    報名時間 | 家長姓名 | 學員姓名 | 電話 | Email | 年級 | 優惠身份 | 午餐 | 狀態
 * 2. Sheet 上方選 擴充功能 → Apps Script，貼上本檔案全部內容
 * 3. 修改下方 CONFIG 的 SHEET_ID（網址中 /d/ 和 /edit 之間那串）
 * 4. 部署 → 新增部署作業 → 類型選「網頁應用程式」
 *    - 執行身分：我
 *    - 誰可以存取：所有人
 * 5. 複製 Web App URL，貼到 signup.html 的 GAS_URL
 *
 * 狀態欄位邏輯：
 * - 第 1–25 位報名 → 狀態「正取」，寄報名確認信
 * - 第 26 位起     → 狀態「候補」，寄候補通知信
 */
const CONFIG = {
  SHEET_ID: 'YOUR_SHEET_ID_HERE',       // TODO: 換成實際 Sheet ID
  SHEET_NAME: '報名名單',                 // 分頁名稱
  CAPACITY: 25,                          // 正取名額
  CAMP_NAME: '清華大學足球冬令營 2027',
  CAMP_DATE: '2027/1/25（一）– 1/29（五）',
  REPLY_EMAIL: 'stayyoung@gmail.com'     // TODO: 信箱確定後更新
};
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    // ---- 基本驗證 ----
    const required = ['parentName', 'studentName', 'phone', 'email', 'grade', 'discount', 'lunch'];
    for (const key of required) {
      if (!data[key] || String(data[key]).trim() === '') {
        return jsonResponse({ status: 'error', message: '缺少必填欄位：' + key });
      }
    }
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
    // ---- 重複報名檢查（同 email + 同學員姓名）----
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][4] === data.email && rows[i][2] === data.studentName) {
        return jsonResponse({ status: 'error', message: '此學員已使用相同信箱報名過' });
      }
    }
    // ---- 判斷正取或候補 ----
    const currentCount = rows.length - 1; // 扣掉標題列
    const isWaitlist = currentCount >= CONFIG.CAPACITY;
    const status = isWaitlist ? '候補' : '正取';
    // ---- 寫入 Sheet ----
    sheet.appendRow([
      new Date(),
      data.parentName,
      data.studentName,
      data.phone,
      data.email,
      data.grade,
      data.discount,
      data.lunch,
      status
    ]);
    // ---- 寄信 ----
    if (isWaitlist) {
      sendWaitlistEmail(data);
    } else {
      sendConfirmEmail(data);
    }
    return jsonResponse({ status: 'ok', waitlist: isWaitlist });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}
/** 報名確認信（正取） */
function sendConfirmEmail(data) {
  const subject = `【${CONFIG.CAMP_NAME}】報名確認信`;
  const body =
`${data.parentName} 家長您好：
已收到 ${data.studentName} 的報名資料，報名登記完成！
── 報名資訊 ──
營隊：${CONFIG.CAMP_NAME}
日期：${CONFIG.CAMP_DATE}
學員：${data.studentName}（${data.grade}）
優惠身份：${data.discount}
午餐：${data.lunch}
── 接下來的流程 ──
1. 報名人數達開班標準並確認開班後，我們會寄送「繳費通知」
2. 完成繳費後即確認錄取
3. 開課前會再寄送行前通知信
開班確認前不會收取任何費用，請安心等候通知。
若有任何問題，歡迎直接回覆本信。
長青運動 Stay Young
${CONFIG.REPLY_EMAIL}`;
  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body,
    replyTo: CONFIG.REPLY_EMAIL,
    name: '長青運動 Stay Young'
  });
}
/** 候補通知信（第 26 位起） */
function sendWaitlistEmail(data) {
  const subject = `【${CONFIG.CAMP_NAME}】候補登記通知`;
  const body =
`${data.parentName} 家長您好：
感謝您為 ${data.studentName} 報名 ${CONFIG.CAMP_NAME}。
目前正取名額（25 位）已滿，您的報名已列入「候補名單」。
若有名額釋出，我們將立即以 email 通知您，屆時再依信中說明完成報名程序即可。
候補期間不會收取任何費用。
若有任何問題，歡迎直接回覆本信。
長青運動 Stay Young
${CONFIG.REPLY_EMAIL}`;
  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body,
    replyTo: CONFIG.REPLY_EMAIL,
    name: '長青運動 Stay Young'
  });
}
/** 統一 JSON 回應 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
/**
 * doGet 保留給之後的後台（?admin）使用
 * 細節等後台設計討論時再實作
 */
function doGet(e) {
  return jsonResponse({ status: 'ok', message: 'API alive' });
}
