export interface PostPayload {
  filterBy: string;
  filterValue: string;
  limit: string;
  page: string;
}
export interface CreatePost {
  visibility: "public" | "private";
  content: string;
  files: string[];
}
export interface EditPost {
  visibility: "public" | "friends";
  content: string;
}
export interface PostProps {
  post: Post;
}
export interface ProfilePicture {
  url: string;
  provider: string;
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
}

export interface Post {
  id: string;
  content: string;
  visibility: "public" | "private"; // adjust as needed
  created_at: string; // ISO Date string, or Date if you prefer
  updated_at: string;
  userId: string;
  files: ProfilePicture[];
  user: PostUser;
  _count: PostCount;
}

export interface PostMeta {
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface PostsResponse {
  posts: Post[];
  meta: PostMeta;
}
