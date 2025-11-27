import {
  fetchAllGifts,
  fetchTranscationsWallet,
  fetchSingleTransaction,
  generatePaymentLink,
  getWalletService,
  sendGift,
} from "@/services/wallet-service.service";
import { GeneratePaymentLinkPayLoad, SendGiftPayload } from "@/types/wallet.types";

export const useGetWallet = async () => {
  const response = await getWalletService();
  return response;
};
export const useFetchTransactions = async () => {
  const response = await fetchTranscationsWallet();
  return response;
};
export const useFetchSingleTransaction = async ({ id }: { id: string }) => {
  const response = await fetchSingleTransaction({ id });
  return response;
};
export const useGetAllGifts = async () => {
  const response = await fetchAllGifts();
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
export const useSendGift = async ({
  data,
}: {
  data: SendGiftPayload;
}) => {
  const response = await sendGift({ data });
  return response;
};