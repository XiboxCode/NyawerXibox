export async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  parseMode: 'MarkdownV2' | 'HTML' = 'MarkdownV2',
): Promise<Response> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  })
  const data = await res.json() as any
  if (!data.ok) {
    console.error('Telegram API error:', JSON.stringify({
      chatId,
      description: data.description,
      textPreview: text.slice(0, 100),
      parseMode,
    }))
    throw new Error(`Telegram: ${data.description}`)
  }
  return data
}
