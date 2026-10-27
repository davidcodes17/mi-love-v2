import apiSecured from "@/security/api-secured";
import { AccountDeletion, LoginPayLoad, ResetPayload, UserProfile } from "@/types/auth.types";
import { sendFcmTokenToServer } from "@/utils/fcm-token.utils";

export const AUTH_STORAGE_KEYS = {
  accessToken: "token",
  signupToken: "signup_verification_token",
  resetEmail: "password_reset_email",
  resetOtp: "password_reset_otp",
  resetToken: "password_reset_token",
} as const;

export const loginService = async ({ data }: { data: LoginPayLoad }) => {
  try {
    const response = await apiSecured.post("/auth/login", data);
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const notificationService = async ({ token }: { token: string }) => {
  try {
    const registered = await sendFcmTokenToServer(token);
    return registered
      ? { success: true }
      : { error: "Failed to register notification device" };
  } catch (error: any) {
    return error?.response?.data || { error: "Failed to register notification device" };
  }
};
export const getProfile = async () => {
  try {
    // Skip toasts for profile fetch (silent operation)
    const response = await apiSecured.get("/profile/me", {
      skipToast: true,
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const uploadService = async ({
  file,
  onProgress,
}: {
  file: any;
  onProgress?: (progress: number) => void;
}) => {
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
      onUploadProgress: ({ loaded, total }) => {
        if (total) onProgress?.(Math.min(1, loaded / total));
      },
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};

export const getUploadJob = async ({ jobId }: { jobId: string }) => {
  try {
    const response = await apiSecured.get(`/upload/jobs/${jobId}`);
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};

export const retryUploadJob = async ({ jobId }: { jobId: string }) => {
  try {
    const response = await apiSecured.post(`/upload/jobs/${jobId}/retry`, {});
    return response.data;
  } catch (error: any) {
    const payload = error?.response?.data;
    return {
      error:
        payload?.error ||
        payload?.message ||
        error?.message ||
        "Failed to retry upload",
      status: error?.response?.status,
    };
  }
};

export const waitForUploadJob = async ({
  jobId,
  timeoutMs = 120000,
}: {
  jobId: string;
  timeoutMs?: number;
}) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await getUploadJob({ jobId });
    const job = res?.data || res?.job || res;
    const status = job?.status;
    if (status === "completed" || status === "succeeded") {
      const fileId =
        job?.file?.id ||
        job?.fileId ||
        job?.result?.id ||
        job?.result?.fileId;
      if (!fileId) throw new Error("Upload completed without a file");
      return fileId;
    }
    if (res?.error || status === "failed" || status === "cancelled") {
      throw new Error(
        job?.error || job?.message || res?.error || "Video upload failed"
      );
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Video upload timed out");
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
    return error?.response?.data?.error;
  }
};

export const forgotPasswordService = async ({ email }: { email: string }) => {
  try {
    const response = await apiSecured.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { message: "Unable to send reset code" };
  }
};

export const getOAuthUrl = (provider: "google" | "apple") => {
  const baseUrl =
    // process.env.EXPO_PUBLIC_API_URL || "https://mi-love-api.onrender.com";
    process.env.EXPO_PUBLIC_API_URL || "https://ft0gnb2q-9999.uks1.devtunnels.ms";
  return `${baseUrl.replace(/\/$/, "")}/auth/${provider}`;
};

export const logoutService = async () => {
  try {
    const response = await apiSecured.post("/auth/logout", {});
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { message: "Unable to contact logout service" };
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
    return error?.response?.data?.error;
  }
};

export const createAccountService = async ({ data }: { data: UserProfile }) => {
  try {
    const response = await apiSecured.post("/auth/signup", data);
    return response.data;
  } catch (error: any) {
    // return the full response body so callers can access message/title/etc
    return error?.response?.data || { message: "An unknown error occurred" };
  }
};

export const resetPasswordService = async ({
  data,
}: {
  data: ResetPayload;
}) => {
  try {
    const response = await apiSecured.post("/auth/reset-password", data);
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const deleteAccountService = async ({
  data,
}: {
  data: AccountDeletion;
}) => {
  try {
    const response = await apiSecured.post("/profile/delete", data);
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
