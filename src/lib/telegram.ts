import type { TelegramApiResponse, ChatAdministrator } from '../types/telegram'

export async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  parseMode: 'MarkdownV2' | 'HTML' = 'MarkdownV2',
): Promise<TelegramApiResponse> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  })
  const data: TelegramApiResponse = await res.json()
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

export async function checkTelegramAdmin(
  botToken: string,
  chatId: number,
  userId: number,
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatAdministrators`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId }),
      },
    )
    const data: TelegramApiResponse<ChatAdministrator[]> = await res.json()
    if (!data.ok) return false
    return data.result!.some((a) => a.user.id === userId)
  } catch {
    return false
  }
}
