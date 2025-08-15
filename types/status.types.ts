export interface ApiResponse<T> {
  data: T;
  meta: {
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  username?: string;
}

export interface StatusViewer {
  id: string;
  userId: string;
  statusId: string;
  viewedAt: string;
  user: User;
}

export interface Status {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  backgroundColor?: string;
  textColor?: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  viewCount: number;
  viewers?: StatusViewer[];
  isViewed?: boolean;
}

export interface CreateStatusPayload {
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  backgroundColor?: string;
  textColor?: string;
}

export interface StatusResponse {
  data: Status[];
  message: string;
}

export interface SingleStatusResponse {
  data: Status;
  message: string;
}
