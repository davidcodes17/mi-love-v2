import {
  deleteAccountService,
  updateProfileService,
} from "@/services/account-service.service";
import { EditProfilePayload } from "@/types/auth.types";

export const useDeleteAccount = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  const response = await deleteAccountService({ password, token });
  return response;
};
export const useUpdateAccountDetails = async ({
  data,
}: {
  data: EditProfilePayload;
}) => {
  const response = await updateProfileService({ data });
  return response;
};
