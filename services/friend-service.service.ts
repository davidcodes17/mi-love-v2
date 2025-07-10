import apiSecured from "@/security/api-secured";

export const getAllPostService = async ({
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
