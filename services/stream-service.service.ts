import apiSecured from "@/security/api-secured";

export interface StreamTokenResponse {
  message: string;
  token: string;
}

export const getStreamToken = async (): Promise<StreamTokenResponse> => {
  try {
    const response = await apiSecured.get<StreamTokenResponse>(`/streams/token`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching stream token:", error);
    throw error?.response?.data?.error || new Error("Failed to fetch stream token");
  }
};

