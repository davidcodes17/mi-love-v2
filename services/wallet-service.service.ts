import apiSecured from "@/security/api-secured";
import { GeneratePaymentLinkPayLoad, SendGiftPayload } from "@/types/wallet.types";

export const getWalletService = async () => {
  try {
    const response = await apiSecured.get(`/wallet`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const fetchTranscationsWallet = async () => {
  try {
    const response = await apiSecured.get(`/wallet/transactions`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const fetchSingleTransaction = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.get(`/wallet/transactions/${id}`, {
      skipToast: true, // Don't show toast for GET requests
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const fetchAllGifts = async () => {
  try {
    const response = await apiSecured.get(`/wallet/gifts`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const generatePaymentLink = async ({
  data,
}: {
  data: GeneratePaymentLinkPayLoad;
}) => {
  try {
    const response = await apiSecured.post(`/wallet/buy-coins`, {
      amount: data?.amount,
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const sendGift = async ({
  data,
}: {
  data: SendGiftPayload;
}) => {
  try {
    const response = await apiSecured.post(`/wallet/gifts/send`, {
      giftId : data?.giftId,
      receiverId : data?.receiverId
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
};
/**
 * Claim a bonus reward from an inactive user re-engagement link
 */
export const claimRewardService = async ({ token }: { token: string }) => {
  try {
    const response = await apiSecured.get(`/wallet/claim-reward/${token}`);
    return response.data;
  } catch (error: any) {
    console.log("Error claiming reward:", error);
    return error?.response?.data || { error: "Failed to claim reward" };
  }
};