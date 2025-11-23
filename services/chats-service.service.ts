import apiSecured from "@/security/api-secured";

export const getAllChatFriends = async () => {
  try {
    const response = await apiSecured.get(`/chats`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const getChatsPerFriend = async ({id}:{id : string}) => {
  try {
    const response = await apiSecured.get(`/chats/${id}/messages`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const generateTokenCall = async () => {
  try {
    const response = await apiSecured.get(`/streams/token`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
}