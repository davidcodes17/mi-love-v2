import apiSecured from "@/security/api-secured";

export const getAllFriends = async ({
  filterBy,
}: {
  filterBy: "blocked" | "friends" | "explore";
}) => {
  try {
    const response = await apiSecured.get(`/friends?filterBy=${filterBy}`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const addFriends = async ({id}:{id : string}) => {
  try {
    const response = await apiSecured.post(`/friends`,{
      friendId : id
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const unFriend = async ({id}:{id : string}) => {
  try {
    const response = await apiSecured.post(`/friends/unfriend`,{
      friendId : id
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
