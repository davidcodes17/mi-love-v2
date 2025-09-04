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
