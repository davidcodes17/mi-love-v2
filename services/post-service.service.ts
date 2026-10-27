import apiSecured from "@/security/api-secured";
import {
  CreateCommentPayload,
  CreatePost,
  EditPost,
  PostPayload,
  VideoFeedPayload,
} from "@/types/post.types";

export type ServiceFailure = {
  error: string;
  message: string;
  status?: number;
  details?: unknown;
};

const failure = (error: any, fallback: string): ServiceFailure => {
  const payload = error?.response?.data;
  const message =
    (typeof payload?.error === "string" && payload.error) ||
    (typeof payload?.message === "string" && payload.message) ||
    (typeof error?.message === "string" && error.message) ||
    fallback;
  return {
    error: message,
    message,
    status: error?.response?.status,
    details: payload,
  };
};

export const getAllPostService = async ({ data }: { data: PostPayload }) => {
  try {
    const response = await apiSecured.get("/posts", { params: data });
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to load posts");
  }
};

export const getVideoPosts = async ({
  data,
}: {
  data?: VideoFeedPayload;
} = {}) => {
  try {
    const limit = data?.limit || "10";
    const params = data?.cursor
      ? { cursor: data.cursor, limit }
      : { page: data?.page || "1", limit };
    const response = await apiSecured.get("/posts/videos", { params });
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to load videos");
  }
};

export const getSinglePost = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.get(`/posts/${id}`);
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to load post");
  }
};

export const createPost = async ({ data }: { data: CreatePost }) => {
  try {
    const response = await apiSecured.post(`/posts`, data);
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to create post");
  }
};

export const unlikePost = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.post(
      `/posts/${id}/unlike`,
      {},
      {
        skipErrorToast: true,
      }
    );
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to unlike post");
  }
};

export const likePost = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.post(
      `/posts/${id}/like`,
      {},
      {
        skipErrorToast: true,
      }
    );
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to like post");
  }
};

export const getAllLike = async ({
  id,
  page = "1",
  limit = "30",
}: {
  id: string;
  page?: string;
  limit?: string;
}) => {
  try {
    const response = await apiSecured.get(`/posts/${id}/likes`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to load likes");
  }
};

export const getPostComments = async ({
  id,
  page = "1",
  limit = "50",
  order = "asc",
}: {
  id: string;
  page?: string;
  limit?: string;
  order?: "asc" | "desc";
}) => {
  try {
    const response = await apiSecured.get(
      `/posts/${id}/comments?page=${page}&limit=${limit}&order=${order}`
    );
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to load comments");
  }
};

export const createPostComment = async ({
  id,
  data,
}: {
  id: string;
  data: CreateCommentPayload;
}) => {
  try {
    const response = await apiSecured.post(`/posts/${id}/comments`, data);
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to create comment");
  }
};

export const deletePostComment = async ({
  id,
  commentId,
}: {
  id: string;
  commentId: string;
}) => {
  try {
    const response = await apiSecured.delete(
      `/posts/${id}/comments/${commentId}`
    );
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to delete comment");
  }
};

export const deletePost = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.delete(`/posts/${id}`);
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to delete post");
  }
};

export const updatePost = async ({
  id,
  data,
}: {
  id: string;
  data: EditPost;
}) => {
  try {
    const response = await apiSecured.put(`/posts/${id}`, data);
    return response.data;
  } catch (error: any) {
    return failure(error, "Failed to update post");
  }
};
