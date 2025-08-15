import { 
  getAllStatus, 
  getMyStatus, 
  getSingleStatus, 
  createStatus, 
  deleteStatus, 
  viewStatus, 
  getStatusViewers 
} from "@/services/status-service.service";
import { CreateStatusPayload } from "@/types/status.types";

export const useGetAllStatus = async () => {
  const response = await getAllStatus();
  return response;
};

export const useGetMyStatus = async () => {
  const response = await getMyStatus();
  return response;
};

export const useGetSingleStatus = async ({ id }: { id: string }) => {
  const response = await getSingleStatus({ id });
  return response;
};

export const useCreateStatus = async ({ data }: { data: CreateStatusPayload }) => {
  const response = await createStatus({ data });
  return response;
};

export const useDeleteStatus = async ({ id }: { id: string }) => {
  const response = await deleteStatus({ id });
  return response;
};

export const useViewStatus = async ({ id }: { id: string }) => {
  const response = await viewStatus({ id });
  return response;
};

export const useGetStatusViewers = async ({ id }: { id: string }) => {
  const response = await getStatusViewers({ id });
  return response;
};
