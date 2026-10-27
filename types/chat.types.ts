export interface ChatResponse {
  data: Chat[];
  meta: Meta;
}

export interface Meta {
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface Chat {
  id: string;
  can_send_messages: boolean;
  type?: "private" | "group";
  isGroup?: boolean;
  name?: string | null;
  image?: ProfilePicture | null;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  messages: Message[];
}

export interface Participant {
  id: string;
  chatId: string;
  mute: string | null;
  userId: string;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: ProfilePicture;
}

export interface ProfilePicture {
  id: string;
  url: string;
  provider: string;
  created_at: string;
  updated_at: string;
  type: string;
  ref: string | null;
  postId: string | null;
}

export interface Message {
  id: string;
  type: ChatMessageType;
  content: string;
  edited: boolean;
  deleted: boolean;
  fileId: string | null;
  userId: string | null;
  created_at: string;
  updated_at: string;
  chatId: string;
  user: Pick<User, "id" | "username"> | null;
  file: FileAttachment | null;
  replyToMessageId?: string | null;
  replyToMessage?: MessageQuote | null;
  reactions?: MessageReaction[];
}

export interface FileAttachment {
  id: string;
  url: string;
  provider: string;
  created_at: string;
  updated_at: string;
  type: string;
  ref: string | null;
  postId: string | null;
}

// types/chat.ts

export interface ProfilePicture {
  id: string;
  url: string;
  provider: string;
  created_at: string;
  updated_at: string;
  type: string;
  ref: string | null;
  postId: string | null;
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: ProfilePicture;
}

// types/chat.types.ts

export type ChatMessageType = "text" | "announcement" | "call" | "video-call";

export interface MessageQuote {
  id: string;
  content: string;
  deleted?: boolean;
  userId?: string | null;
  user?: Pick<User, "id" | "username"> | null;
}

export interface MessageReaction {
  id?: string;
  emoji: ReactionEmoji;
  userId: string;
  messageId?: string;
}

export type ReactionEmoji = "❤️" | "👍" | "😂" | "😮" | "😢" | "🙏";

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  edited: boolean;
  deleted: boolean;
  fileId?: string | null;
  userId?: string | null;
  created_at: string;
  updated_at: string;
  chatId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  file?: any | null;
  replyToMessageId?: string | null;
  replyToMessage?: MessageQuote | null;
  reactions?: MessageReaction[];
  clientId?: string;
}


export interface ChatMeta {
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface ChatResponseMessage {
  data: ChatMessage[];
  meta: ChatMeta;
}
