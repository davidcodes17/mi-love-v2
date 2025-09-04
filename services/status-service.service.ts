import apiSecured from "@/security/api-secured";
import { CreateStatusPayload } from "@/types/status.types";

export const getAllStatus = async () => {
  try {
    const response = await apiSecured.get(`/status`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const getMyStatus = async () => {
  try {
    const response = await apiSecured.get(`/status/me`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const getSingleStatus = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.get(`/status/${id}`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const createStatus = async ({ data }: { data: CreateStatusPayload }) => {
  try {
    const response = await apiSecured.post(`/status`, data);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const deleteStatus = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.delete(`/status/${id}`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const viewStatus = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.post(`/status/${id}/view`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const getStatusViewers = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.get(`/status/${id}/viewers`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
