import {
  createStatus,
  deleteStatus,
  getFriendsStatuses,
  getMyStatuses,
} from "@/services/status-service.service";
import { CreateStatusPayload } from "@/types/status.types";

export const useGetFriendsStatuses = async ({
  page,
  limit,
}: {
  page?: string;
  limit?: string;
} = {}) => {
  return getFriendsStatuses({ page, limit });
};

export const useGetMyStatuses = async () => {
  return getMyStatuses();
};

export const useCreateStatus = async ({
  data,
}: {
  data: CreateStatusPayload;
}) => {
  return createStatus({ data });
};

export const useDeleteStatus = async ({ id }: { id: string }) => {
  return deleteStatus({ id });
};
