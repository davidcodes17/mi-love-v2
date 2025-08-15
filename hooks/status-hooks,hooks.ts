import { getAllStatus } from "@/services/status-service.service";

export const useGetAllStatus = async () => {
  const response = await getAllStatus();
  return response;
};
