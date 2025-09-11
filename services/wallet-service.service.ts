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
