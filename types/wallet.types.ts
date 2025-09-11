export interface WalletResponse {
  data: {
    balance: string;
    updated_at: Date;
  };
  message: string;
}

export interface GeneratePaymentLinkPayLoad {
  amount: number;
}
export interface PaymentLinkResponse {
  message: string;
  link: string;
}
export interface Transaction {
  amount: number;
  id: string;
  currency: string;
  status: "pending" | "success" | "failed"; // restrict to known values
  type: "debit" | "credit"; // assuming only debit/credit
  created_at: string; // ISO date string
}

export interface Meta {
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  meta: Meta;
}

export interface GiftImage {
  url: string;
}

export interface GiftCategory {
  name: string;
}

export interface Gift {
  id: string;
  points: string; // stored as string in your JSON, can be changed to number if API returns numeric
  name: string;
  description: string | null;
  imageId: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  gift_category_id: string;
  image: GiftImage;
  category: GiftCategory;
}

export interface GiftsResponse {
  data: Gift[];
}

export interface SendGiftPayload {
  giftId: string;
  receiverId: string;
}
