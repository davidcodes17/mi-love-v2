export interface ApiResponse<T> {
  data: T;
  meta: {
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
}
