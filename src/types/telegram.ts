export interface TelegramApiResponse<T = unknown> {
  ok: boolean
  result?: T
  description?: string
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  my_chat_member?: TelegramChatMemberUpdate
}

export interface TelegramMessage {
  message_id: number
  chat: TelegramChat
  text?: string
  from?: TelegramUser
  entities?: TelegramMessageEntity[]
}

export interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
  title?: string
  username?: string
}

export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  username?: string
}

export interface TelegramMessageEntity {
  type: string
  offset: number
  length: number
}

export interface TelegramChatMemberUpdate {
  chat: TelegramChat
  from: TelegramUser
  new_chat_member: {
    status: string
    user: TelegramUser
  }
}

export interface ChatAdministrator {
  user: TelegramUser
  status: string
}
