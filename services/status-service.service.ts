import apiSecured from "@/security/api-secured";
import { CreateStatusPayload } from "@/types/status.types";

const failure = (error: any, fallback: string) => {
  const payload = error?.response?.data;
  const message =
    (typeof payload?.error === "string" && payload.error) ||
    (typeof payload?.message === "string" && payload.message) ||
    error?.message ||
    fallback;
  return {
    error: message,
    message,
    status: error?.response?.status,
    details: payload,
  };
};

export const getFriendsStatuses = async ({
  page = "1",
  limit = "20",
}: {
  page?: string;
  limit?: string;
} = {}) => {
  try {
    const response = await apiSecured.get("/status", {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to load stories");
  }
};

export const getMyStatuses = async () => {
  try {
    const response = await apiSecured.get(`/status/me`);
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to load your stories");
  }
};

export const createStatus = async ({ data }: { data: CreateStatusPayload }) => {
  try {
    const response = await apiSecured.post(`/status`, data);
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to create story");
  }
};

export const deleteStatus = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.delete(`/status/${id}`);
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to delete story");
  }
};
