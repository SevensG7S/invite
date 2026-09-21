export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date, time, wish, comment } = req.body || {};

  // Google Sheets Web App URL
  const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_URL || 'https://script.google.com/macros/s/AKfycbwsZLU4J0bWaag7JCk3t4aunWfaFxWgvDRgGeiE1m5qPwREnI4weY-ipnTeYBiJWTGydw/exec';
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const payload = {
    timestamp: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
    date: date || 'Не указана',
    time: time || 'Не указано',
    wish: wish || '—',
    comment: comment || '—'
  };

  const results = {};

  // 1. Send to Google Sheet (if configured)
  if (sheetsWebhookUrl) {
    try {
      const gsResponse = await fetch(sheetsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      results.googleSheets = 'ok';
    } catch (err) {
      console.error('Error sending to Google Sheets:', err);
      results.googleSheets = 'error: ' + err.message;
    }
  }

  // 2. Also send to Telegram if configured
  if (botToken && chatId) {
    try {
      const text = `🎉 *НОВАЯ ЗАПИСЬ В ТАБЛИЦЕ! ОНА СОГЛАСИЛАСЬ!* 🥰\n\n` +
        `🗓 *Дата:* ${payload.date}\n` +
        `⏰ *Время:* ${payload.time}\n` +
        (wish ? `💫 *Пожелания:* ${wish}\n` : '') +
        (comment ? `💌 *От неё:* ${comment}\n` : '');

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });
      results.telegram = 'ok';
    } catch (err) {
      console.error('Error sending to Telegram:', err);
      results.telegram = 'error: ' + err.message;
    }
  }

  return res.status(200).json({ success: true, results, payload });
}
