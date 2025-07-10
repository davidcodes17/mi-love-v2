import {
  createPost,
  deletePost,
  getAllLike,
  getAllPostService,
  getSinglePost,
  likePost,
  unlikePost,
  updatePost,
} from "@/services/post-service.service";
import { CreatePost, EditPost, PostPayload } from "@/types/post.types";

export const useGetAllPosts = async ({ data }: { data: PostPayload }) => {
  const response = await getAllPostService({ data });
  return response;
};
export const useGetSinglePost = async ({ id }: { id: string }) => {
  const response = await getSinglePost({ id });
  return response;
};
export const useCreatePost = async ({ data }: { data: CreatePost }) => {
  const response = await createPost({ data });
  return response;
};
export const useUnlikePost = async ({ id }: { id: string }) => {
  const response = await unlikePost({ id });
  return response;
};
export const useLikePost = async ({ id }: { id: string }) => {
  const response = await likePost({ id });
  return response;
};
export const useGetAllLikes = async ({ id }: { id: string }) => {
  const response = await getAllLike({ id });
  return response;
};
export const useDeletePost = async ({ id }: { id: string }) => {
  const response = await deletePost({ id });
  return response;
};
export const useUpdatePost = async ({
  id,
  data,
}: {
  id: string;
  data: EditPost;
}) => {
  const response = await updatePost({ id, data });
  return response;
};
