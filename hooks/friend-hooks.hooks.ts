import { addFriends, getAllFriends, getSingleFriend, unFriend } from "@/services/friend-service.service";
import { FilterBy } from "@/types/friend.types";

export const useGetAllFriends = async ({
  filterBy,
}: {
  filterBy: FilterBy;
}) => {
  const response = await getAllFriends({ filterBy: filterBy.filterBy });
  return response;
};

export const useAddFriend = async ({ id }: { id: string }) => {
  const response = await addFriends({ id });
  return response;
};
export const useUnFriend = async ({ id }: { id: string }) => {
  const response = await unFriend({ id });
  return response;
};
export const useGetSingleFriend = async ({ id }: { id: string }) => {
  const response = await getSingleFriend({ id });
  return response;
};
