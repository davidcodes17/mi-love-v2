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
  type: "text" | "announcement"; // can extend with more types
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

export type ChatMessageType = "text" | "announcement";

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
