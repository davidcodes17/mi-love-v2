import apiSecured from "@/security/api-secured";
import { LoginPayLoad } from "@/types/auth.types";

export const loginService = async ({ data }: { data: LoginPayLoad }) => {
  try {
    const response = await apiSecured.post("/auth/login", data);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const sendOtp = async ({ email }: { email: string }) => {
  try {
    const response = await apiSecured.post("/auth/send-otp", {
        email : email
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const verifyOtp = async ({ email,otp }: { email: string,otp : string }) => {
  try {
    const response = await apiSecured.post("/auth/verify-otp", {
        email : email,
        otp : otp
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
