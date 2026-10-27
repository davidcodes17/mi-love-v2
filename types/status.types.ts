import { ProfilePicture, PostUser } from "./post.types";

export interface StatusItem {
  id: string;
  content?: string | null;
  created_at: string;
  updated_at?: string;
  userId: string;
  file?: ProfilePicture | null;
  fileId?: string | null;
  user?: PostUser;
}

export interface StatusGroup {
  userId: string;
  user: PostUser;
  statuses: StatusItem[];
}

export interface CreateStatusPayload {
  content?: string;
  fileId?: string;
}

export interface StatusListResponse {
  data?: StatusGroup[] | StatusItem[];
  statuses?: StatusGroup[] | StatusItem[];
  meta?: {
    totalPages?: number;
    currentPage?: number;
    itemsPerPage?: number;
    totalItems?: number;
  };
}

const responseArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.statuses)) return value.statuses;
  if (Array.isArray(value?.data?.statuses)) return value.data.statuses;
  return [];
};

export const normalizeStatusGroups = (
  friendsResponse: unknown,
  myResponse: unknown,
  me?: Partial<PostUser> | null,
  includeEmptyMe = false
): StatusGroup[] => {
  const byUser = new Map<string, StatusGroup>();
  const add = (userId: string, user: PostUser, statuses: StatusItem[]) => {
    if (!userId) return;
    const current = byUser.get(userId);
    const unique = [...(current?.statuses || []), ...statuses].filter(
      (status, index, all) =>
        !!status?.id && all.findIndex((item) => item.id === status.id) === index
    );
    unique.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    byUser.set(userId, {
      userId,
      user: (current?.user || user) as PostUser,
      statuses: unique,
    });
  };

  if (me?.id) {
    add(me.id, me as PostUser, responseArray(myResponse));
  }

  responseArray(friendsResponse).forEach((item: any) => {
    const userId = item?.userId || item?.user?.id;
    if (!userId || userId === me?.id) return;
    if (Array.isArray(item?.statuses) || Array.isArray(item?.data)) {
      add(userId, item.user, responseArray(item));
    } else {
      add(userId, item.user, [item]);
    }
  });

  return [...byUser.values()].filter(
    (group) => group.statuses.length > 0 || (includeEmptyMe && group.userId === me?.id)
  );
};
