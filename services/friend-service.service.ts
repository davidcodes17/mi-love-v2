import apiSecured from "@/security/api-secured";

export const getAllFriends = async ({
  filterBy,
  filterValue,
}: {
  filterBy: "blocked" | "friends" | "explore";
  filterValue?: string;
}) => {
  try {
    // Skip success toast for GET requests (silent operation)
    const response = await apiSecured.get(`/friends`, {
      params: {
        filterBy,
        filterValue,
      },
      skipSuccessToast: true, // Still show error toasts if needed
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const addFriends = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.post(`/friends`, {
      friendId: id,
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const unFriend = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.post(`/friends/unfriend`, {
      friendId: id,
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const blockFriend = async ({
  id,
  reason,
}: {
  id: string;
  reason: string;
}) => {
  try {
    const response = await apiSecured.post("/friends/block", {
      friendId: id,
      reason,
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { message: "Unable to block this user" };
  }
};

export const unblockFriend = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.post("/friends/unblock", {
      friendId: id,
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { message: "Unable to unblock this user" };
  }
};

export const getSingleFriend = async ({ id }: { id: string }) => {
  try {
    // Skip success toast for GET requests (silent operation)
    const response = await apiSecured.get(`/profile/${id}`, {
      skipSuccessToast: true, // Still show error toasts if needed
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
