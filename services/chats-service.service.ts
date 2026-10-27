import apiSecured from "@/security/api-secured";
import { ReactionEmoji } from "@/types/chat.types";

export const getAllChatFriends = async () => {
  try {
    const response = await apiSecured.get(`/chats`);
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const getChatDetail = async ({ id }: { id: string }) => {
  const response = await apiSecured.get(`/chats/${id}`, {
    skipSuccessToast: true,
  });
  return response.data;
};

export const getChatsPerFriend = async ({
  id,
  page = 1,
  limit = 30,
}: {
  id: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiSecured.get(`/chats/${id}/messages`, {
    params: { page, limit },
    skipSuccessToast: true,
  });
  return response.data;
};

export interface SendMessagePayload {
  chatId: string;
  content: string;
  fileId?: string | null;
  replyToMessageId?: string | null;
  toUserId?: string;
  clientId?: string;
}

export const sendChatMessage = async (payload: SendMessagePayload) => {
  const response = await apiSecured.post(`/chats/send-message`, payload, {
    skipSuccessToast: true,
  });
  return response.data;
};

export const reactToMessage = async ({
  messageId,
  emoji,
}: {
  messageId: string;
  emoji: ReactionEmoji;
}) => {
  const response = await apiSecured.post(
    `/chats/messages/${messageId}/reactions`,
    { emoji },
    { skipSuccessToast: true }
  );
  return response.data;
};

export const createGroupChat = async ({
  name,
  memberIds,
}: {
  name: string;
  memberIds: string[];
}) => {
  const response = await apiSecured.post(
    `/chats/groups`,
    { name, memberIds },
    { skipSuccessToast: true }
  );
  return response.data;
};

export const addGroupMembers = async ({
  chatId,
  memberIds,
}: {
  chatId: string;
  memberIds: string[];
}) => {
  const response = await apiSecured.post(
    `/chats/groups/${chatId}/members`,
    { memberIds },
    { skipSuccessToast: true }
  );
  return response.data;
};