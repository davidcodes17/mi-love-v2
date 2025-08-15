import apiSecured from "@/security/api-secured";
import { EditProfilePayload } from "@/types/auth.types";

export const deleteAccountService = async ({
  password,
  token,
}: {
  token: string;
  password: string;
}) => {
  try {
    const response = await apiSecured.post(`/profile/delete`, {
      token: token,
      password: password,
    });
    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error;
  }
};

export const updateProfileService = async ({
  data,
}: {
  data: EditProfilePayload;
}) => {
  try {
    const response = await apiSecured.put(`/profile/me`, {
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      country: null,
      phone_number: data.phone_number,
      emergency_contact: data.emergency_contact,
      date_of_birth: null,
      home_address: null,
      gender: "",
      profile_picture_id: data?.profile_picture_id,
      bio: data.bio,
      added_interests: data.added_interests,
      removed_interests: data.removed_interests,
    });
    return response.data;
  } catch (error: any) {
    console.error(error);
    return error?.response?.data;
  }
};
