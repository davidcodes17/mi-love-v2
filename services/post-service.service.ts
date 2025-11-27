import apiSecured from "@/security/api-secured";
import { CreatePost, EditPost, PostPayload } from "@/types/post.types";

export const getAllPostService = async ({ data }: { data: PostPayload }) => {
  try {
    const response = await apiSecured.get(
      `/posts?filterBy=${data?.filterBy}&filterValue=${data?.filterValue}&limit=${data?.limit}&page=${data?.page}`
    );
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const getSinglePost = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.get(`/posts/${id}`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const createPost = async ({ data }: { data: CreatePost }) => {
  try {
    const response = await apiSecured.post(`/posts`, data);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const unlikePost = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.post(`/posts/${id}/unlike`, {}, {
      skipErrorToast: true, // We handle errors in the component
    });
    return response.data;
  } catch (error: any) {
    console.error("Unlike post error:", error);
    return { error: error?.response?.data?.error || error?.message || "Failed to unlike post" };
  }
};
export const likePost = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.post(`/posts/${id}/like`, {}, {
      skipErrorToast: true, // We handle errors in the component
    });
    return response.data;
  } catch (error: any) {
    console.error("Like post error:", error);
    return { error: error?.response?.data?.error || error?.message || "Failed to like post" };
  }
};
export const getAllLike = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.get(`/posts/${id}/likes`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};
export const deletePost = async ({ id }: { id: string }) => {
  try {
    const response = await apiSecured.delete(`/posts/${id}`);
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
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
    console.log(error);
    return error?.response?.data?.error;
  }
};
