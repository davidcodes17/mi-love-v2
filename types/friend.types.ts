import { UserProfileR } from "./auth.types";

export interface FilterBy {
  filterBy: "blocked" | "friends" | "explore";
}

export interface FriendsListResponse {
  message: string;
  data: UserProfileR[];
  meta: {
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
}
