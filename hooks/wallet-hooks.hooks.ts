import {
  fetchAllGifts,
  fetchTranscationsWallet,
  fetchSingleTransaction,
  generatePaymentLink,
  getWalletService,
  sendGift,
  claimRewardService,
  confirmWalletTransaction,
  deductWalletService,
} from "@/services/wallet-service.service";
import { GeneratePaymentLinkPayLoad, SendGiftPayload } from "@/types/wallet.types";

export const useGetWallet = async () => {
  const response = await getWalletService();
  return response;
};
export const useFetchTransactions = async ({
  page = 1,
  limit = 20,
}: { page?: number; limit?: number } = {}) => {
  const response = await fetchTranscationsWallet({ page, limit });
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

export const useClaimReward = async ({ token }: { token: string }) => {
  const response = await claimRewardService({ token });
  return response;
};

export const useConfirmWalletTransaction = async ({
  id,
  reference,
}: {
  id?: string;
  reference?: string;
}) => confirmWalletTransaction({ id, reference });

export const useDeductWallet = async (data: {
  amount: number;
  reason?: string;
  reference?: string;
}) => deductWalletService(data);