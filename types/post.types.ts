export interface PostPayload {
  filterBy: string;
  filterValue: string;
  limit: string;
  page: string;
}

export interface CreatePost {
  visibility: "public" | "private" | "friends";
  content?: string;
  files?: string[];
}

export interface EditPost {
  visibility: "public" | "friends";
  content: string;
}

export interface PostProps {
  post: Post;
  onDeleted?: (postId: string) => void;
  onUpdated?: (post: Post) => void;
}

export interface ProfilePicture {
  id?: string;
  url: string;
  provider?: string;
  type?: string;
  thumbnailUrl?: string;
}

export interface PostUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture: ProfilePicture;
}

export interface PostCount {
  files: number;
  likes: number;
  comments?: number;
}

export interface Post {
  id: string;
  content: string;
  visibility: "public" | "private" | "friends";
  created_at: string;
  updated_at: string;
  userId: string;
  files: ProfilePicture[];
  user: PostUser;
  _count: PostCount;
  likedByMe?: boolean;
}

export interface PostMeta {
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  nextCursor?: string | null;
}

export interface PostsResponse {
  posts: Post[];
  meta: PostMeta;
  data?: Post[];
}

export interface LikesResponse {
  data: PostUser[];
  meta: PostMeta;
}

export interface CommentUser {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: ProfilePicture;
}

export interface PostComment {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  postId?: string;
  userId?: string;
  parentId?: string | null;
  user: CommentUser;
  replies?: PostComment[];
  deleted?: boolean;
}

export interface CommentsResponse {
  data?: PostComment[];
  comments?: PostComment[];
  meta?: PostMeta;
}

export interface CreateCommentPayload {
  content: string;
  parentId?: string;
}

export interface VideoFeedPayload {
  page?: string;
  limit?: string;
  cursor?: string;
}
