import apiSecured from "@/security/api-secured";

export const getAllStatus = async () => {
  try {
    const response = await apiSecured.get(`/status`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
