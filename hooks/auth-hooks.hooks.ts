import {
  createAccountService,
  getProfile,
  loginService,
  resetPasswordService,
  sendOtp,
  uploadService,
  verifyOtp,
} from "@/services/auth-service.service";
import { LoginPayLoad, ResetPayload, UserProfile, UserProfileR } from "@/types/auth.types";
import { create } from "zustand";

export const loginServiceProxy = async ({ data }: { data: LoginPayLoad }) => {
  const response = await loginService({ data });
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
export const useUploadService = async ({ file }: { file: any }) => {
  const response = await uploadService({ file });
  return response;
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
