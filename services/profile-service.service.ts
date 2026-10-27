import apiSecured from "@/security/api-secured";

/**
 * Track a profile view when user views someone's profile
 * This notifies the viewed user that their profile was seen
 */
export const trackProfileViewService = async (userId: string) => {
  try {
    const response = await apiSecured.post(`/profile/${userId}/view`, {}, {
      skipToast: true, // Silent operation - don't show toast
    });
    return response.data;
  } catch (error: any) {
    // Silently fail - this shouldn't block profile loading
    return null;
  }
};

/**
 * Get profile by user ID
 */
export const getProfileByIdService = async (userId: string) => {
  try {
    const response = await apiSecured.get(`/profile/${userId}`, {
      skipToast: true,
    });
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { error: "Failed to get profile" };
  }
};
