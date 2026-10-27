import apiSecured from "@/security/api-secured";
import { GeneratePaymentLinkPayLoad, SendGiftPayload } from "@/types/wallet.types";

const unwrapData = (value: any): any => {
  let current = value;
  while (
    current &&
    !Array.isArray(current) &&
    typeof current === "object" &&
    Object.keys(current).length === 1 &&
    "data" in current
  ) {
    current = current.data;
  }
  return current;
};

export const normalizeWallet = (response: any) => {
  const payload = unwrapData(response);
  const nested = payload?.wallet ?? payload?.data?.wallet ?? payload?.data;
  const wallet = nested && typeof nested === "object" ? nested : payload;
  const balance = Number(
    wallet?.balance ?? payload?.balance ?? response?.balance ?? response?.data?.balance ?? 0
  );

  return { ...(wallet ?? {}), balance: Number.isFinite(balance) ? balance : 0 };
};

export const getWalletService = async () => {
  try {
    const response = await apiSecured.get(`/wallet`);
    return normalizeWallet(response.data);
  } catch (error: any) {
    return error?.response?.data || { error: "Failed to fetch wallet" };
  }
};

export const fetchTranscationsWallet = async ({
  page = 1,
  limit = 20,
}: { page?: number; limit?: number } = {}) => {
  try {
    const response = await apiSecured.get(`/wallet/transactions`, {
      params: { page, limit },
      skipToast: true,
    });
    const payload = response.data?.data ?? response.data;
    const data = Array.isArray(payload)
      ? payload
      : payload?.data ?? payload?.transactions ?? [];
    const rawMeta = response.data?.meta ?? payload?.meta ?? {};
    return {
      data,
      meta: {
        page: Number(rawMeta.page ?? rawMeta.currentPage ?? page),
        limit: Number(rawMeta.limit ?? rawMeta.itemsPerPage ?? limit),
        totalItems: Number(rawMeta.totalItems ?? rawMeta.total ?? data.length),
        totalPages: Number(rawMeta.totalPages ?? rawMeta.lastPage ?? 1),
      },
    };
  } catch (error: any) {
    return error?.response?.data || { error: "Failed to fetch transactions" };
  }
};
export const fetchSingleTransaction = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.get(`/wallet/transactions/${id}`, {
      skipToast: true, // Don't show toast for GET requests
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const fetchAllGifts = async () => {
  try {
    const response = await apiSecured.get(`/wallet/gifts`);
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};
export const generatePaymentLink = async ({
  data,
}: {
  data: GeneratePaymentLinkPayLoad;
}) => {
  try {
    const response = await apiSecured.post(`/wallet/buy-coins`, data);
    return response.data;
  } catch (error: any) {
    return error?.response?.data?.error;
  }
};

export const confirmWalletTransaction = async ({
  id,
  reference,
}: {
  id?: string;
  reference?: string;
}) => {
  const identifier = id || reference;
  if (!identifier) return { error: "A transaction ID or reference is required" };

  try {
    const response = await apiSecured.get(
      `/wallet/transactions/${encodeURIComponent(identifier)}`,
      {
        params: reference ? { reference } : undefined,
        skipToast: true,
      }
    );
    return response.data?.data ?? response.data;
  } catch (error: any) {
    return error?.response?.data || { error: "Unable to confirm transaction" };
  }
};

export const deductWalletService = async ({
  amount,
  reason,
  reference,
}: {
  amount: number;
  reason?: string;
  reference?: string;
}) => {
  try {
    const response = await apiSecured.post("/wallet/deduct", {
      amount,
      ...(reason ? { reason } : {}),
      ...(reference ? { reference } : {}),
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { error: "Wallet deduction failed" };
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
    return error?.response?.data || { error: "Failed to claim reward" };
  }
};