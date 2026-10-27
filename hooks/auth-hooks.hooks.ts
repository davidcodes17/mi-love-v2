import { initiatePanicButton } from "@/services/account-service.service";
import {
  AUTH_STORAGE_KEYS,
  createAccountService,
  deleteAccountService,
  forgotPasswordService,
  getOAuthUrl,
  getProfile,
  loginService,
  logoutService,
  notificationService,
  resetPasswordService,
  retryUploadJob,
  sendOtp,
  uploadService,
  verifyOtp,
  waitForUploadJob,
} from "@/services/auth-service.service";
import {
  AccountDeletion,
  LoginPayLoad,
  PanicButtonPayload,
  ResetPayload,
  UserProfile,
  UserProfileR,
} from "@/types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { create } from "zustand";
import { useUserStore } from "@/store/store";

export const loginServiceProxy = async ({ data }: { data: LoginPayLoad }) => {
  const response = await loginService({ data });
  return response;
};
export const useNotificationService = async ({ token }: { token: string }) => {
  const response = await notificationService({ token });
  return response;
};
export const useResetPasswordService = async ({
  data,
}: {
  data: ResetPayload;
}) => {
  const response = await resetPasswordService({ data });
  return response;
};
export const useCreateAccountService = async ({
  data,
}: {
  data: UserProfile;
}) => {
  const response = await createAccountService({ data });
  return response;
};
export const useUploadService = async ({
  file,
  onProgress,
}: {
  file: any;
  onProgress?: (progress: number) => void;
}) => {
  const response = await uploadService({ file, onProgress });
  return response;
};

export const useWaitForUploadJob = async ({ jobId }: { jobId: string }) => {
  return waitForUploadJob({ jobId });
};
export const useRetryUploadJob = async ({ jobId }: { jobId: string }) => {
  return retryUploadJob({ jobId });
};
export const useGetProfile = async () => {
  const response = await getProfile();
  return response;
};
export const useSendOtp = async ({
  email,
  exsists,
}: {
  email: string;
  exsists: boolean;
}) => {
  const response = await sendOtp({ email, exsists });
  return response;
};

export const useForgotPassword = async ({ email }: { email: string }) => {
  return forgotPasswordService({ email });
};

export const launchOAuth = async (provider: "google" | "apple") => {
  return WebBrowser.openAuthSessionAsync(getOAuthUrl(provider));
};
export const useVerifyOtp = async ({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: "verify" | "reset";
}) => {
  const response = await verifyOtp({ email, otp, type });
  return response;
};

interface UserProfileStore {
  profile: UserProfileR | null;
  setProfile: (profile: UserProfileR) => void;
  clearProfile: () => void;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));

export const logoutAndClearSession = async () => {
  let response: any;
  try {
    const { unregisterPushNotificationDevice } = await import(
      "@/utils/fcm-token.utils"
    );
    await unregisterPushNotificationDevice().catch(() => false);
    response = await logoutService();
  } finally {
    await AsyncStorage.multiRemove([
      ...Object.values(AUTH_STORAGE_KEYS),
      "email",
      "otp",
    ]);
    useUserStore.getState().clearUser();
    useUserProfileStore.getState().clearProfile();
  }
  return response;
};

export const useInitiatePanicButton = async ({
  data,
}: {
  data: PanicButtonPayload;
}) => {
  const response = await initiatePanicButton({ data });
  return response;
};
export const useDeleteAccount = async ({
  data,
}: {
  data: AccountDeletion;
}) => {
  const response = await deleteAccountService({ data });
  return response;
};
