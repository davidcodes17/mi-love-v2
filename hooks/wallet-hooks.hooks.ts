import {
  fetchTranscationsWallet,
  generatePaymentLink,
  getWalletService,
} from "@/services/wallet-service.service";
import { GeneratePaymentLinkPayLoad } from "@/types/wallet.types";

export const useGetWallet = async () => {
  const response = await getWalletService();
  return response;
};
export const useFetchTransactions = async () => {
  const response = await fetchTranscationsWallet();
  return response;
};
export const useGeneratePaymentLink = async ({
  data,
}: {
  data: GeneratePaymentLinkPayLoad;
}) => {
  const response = await generatePaymentLink({ data });
  return response;
};
