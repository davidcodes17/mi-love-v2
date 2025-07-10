import apiSecured from "@/security/api-secured";
import { LoginPayLoad, ResetPayload, UserProfile } from "@/types/auth.types";

export const loginService = async ({ data }: { data: LoginPayLoad }) => {
  try {
    const response = await apiSecured.post("/auth/login", data);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const getProfile = async () => {
  try {
    const response = await apiSecured.get("/profile/me");
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const uploadService = async ({ file }: { file: any }) => {
  try {
    const formData = new FormData();
    formData.append("files", {
      uri: file.uri,
      name: file.name || "photo.jpg",
      type: file.type || "image/jpeg",
    } as any);
    const response = await apiSecured.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const sendOtp = async ({
  email,
  exsists,
}: {
  email: string;
  exsists: boolean;
}) => {
  try {
    const response = await apiSecured.post("/auth/send-otp", {
      email: email,
      check_exists: exsists,
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const verifyOtp = async ({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: "verify" | "reset";
}) => {
  try {
    const response = await apiSecured.post("/auth/verify-otp", {
      email: email,
      otp: otp,
      type: type,
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const createAccountService = async ({ data }: { data: UserProfile }) => {
  try {
    const response = await apiSecured.post("/auth/signup", data);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const resetPasswordService = async ({ data }: { data: ResetPayload }) => {
  try {
    const response = await apiSecured.post("/auth/reset-password", data);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
