import apiSecured from "@/security/api-secured";
import { EditProfilePayload, PanicButtonPayload } from "@/types/auth.types";

export const deleteAccountService = async ({
  password,
  token,
}: {
  token: string;
  password: string;
}) => {
  try {
    const response = await apiSecured.post(`/profile/delete`, {
      token: token,
      password: password,
    });
    return response.data;
  } catch (error: any) {
    return (
      error?.response?.data || {
        error: "Unable to delete account",
        message: "Unable to delete account",
      }
    );
  }
};

export const updateProfileService = async ({
  data,
}: {
  data: EditProfilePayload;
}) => {
  try {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );
    const response = await apiSecured.put(`/profile/me`, payload);
    return response.data;
  } catch (error: any) {
    return error?.response?.data;
  }
};

export const initiatePanicButton = async ({ data }: { data: PanicButtonPayload }) => {
  try {
    const response = await apiSecured.post("/emergencies/panic", data);
    return { success: true, data: response.data };
  } catch (error: any) {
    const responseData = error?.response?.data;
    return { success: false, data: responseData, status: error?.response?.status };
  }
};
