import apiSecured from "@/security/api-secured";
import { GeneratePaymentLinkPayLoad } from "@/types/wallet.types";

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
