import {
  loginService,
  sendOtp,
  verifyOtp,
} from "@/services/auth-service.service";
import { LoginPayLoad } from "@/types/auth.types";

export const loginServiceProxy = async ({ data }: { data: LoginPayLoad }) => {
  const response = await loginService({ data });
  return response;
};
export const useSendOtp = async ({ email }: { email: string }) => {
  const response = await sendOtp({ email });
  return response;
};
export const useVerifyOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const response = await verifyOtp({ email, otp });
  return response;
};
