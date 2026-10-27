import {
  createPost,
  createPostComment,
  deletePost,
  deletePostComment,
  getAllLike,
  getAllPostService,
  getPostComments,
  getSinglePost,
  getVideoPosts,
  likePost,
  unlikePost,
  updatePost,
} from "@/services/post-service.service";
import {
  CreateCommentPayload,
  CreatePost,
  EditPost,
  PostPayload,
  VideoFeedPayload,
} from "@/types/post.types";

export const useGetAllPosts = async ({ data }: { data: PostPayload }) => {
  const response = await getAllPostService({ data });
  return response;
};

export const useGetVideoPosts = async ({
  data,
}: {
  data?: VideoFeedPayload;
} = {}) => {
  const response = await getVideoPosts({ data });
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

export const useGetAllLikes = async ({
  id,
  page,
  limit,
}: {
  id: string;
  page?: string;
  limit?: string;
}) => {
  const response = await getAllLike({ id, page, limit });
  return response;
};

export const useGetPostComments = async ({
  id,
  page,
  limit,
  order,
}: {
  id: string;
  page?: string;
  limit?: string;
  order?: "asc" | "desc";
}) => {
  const response = await getPostComments({ id, page, limit, order });
  return response;
};

export const useCreatePostComment = async ({
  id,
  data,
}: {
  id: string;
  data: CreateCommentPayload;
}) => {
  const response = await createPostComment({ id, data });
  return response;
};

export const useDeletePostComment = async ({
  id,
  commentId,
}: {
  id: string;
  commentId: string;
}) => {
  const response = await deletePostComment({ id, commentId });
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
