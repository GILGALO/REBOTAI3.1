export async function sendTelegramMessage(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Telegram] Bot token or Chat ID not configured in ENV. Message skipped.");
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Telegram] API Error:", error);
    } else {
      console.log("[Telegram] Message sent successfully to", chatId);
    }
  } catch (err) {
    console.error("[Telegram] Connection Failed:", err);
  }
}
