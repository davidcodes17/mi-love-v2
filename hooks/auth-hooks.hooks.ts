import {
  createAccountService,
  loginService,
  sendOtp,
  uploadService,
  verifyOtp,
} from "@/services/auth-service.service";
import { LoginPayLoad, UserProfile } from "@/types/auth.types";

export const loginServiceProxy = async ({ data }: { data: LoginPayLoad }) => {
  const response = await loginService({ data });
  return response;
};
export const useCreateAccountService = async ({ data }: { data: UserProfile }) => {
  const response = await createAccountService({ data });
  return response;
};
export const useUploadService = async ({ file }: { file: any }) => {
  const response = await uploadService({ file });
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
