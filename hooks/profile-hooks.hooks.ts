import { trackProfileViewService, getProfileByIdService } from "@/services/profile-service.service";

/**
 * Hook to get a user's profile and track the view
 */
export const useGetProfileById = async ({ userId }: { userId: string }) => {
  try {
    const response = await getProfileByIdService(userId);
    
    // Track the profile view in background (don't wait for it)
    trackProfileViewService(userId).catch((err) => {
    });

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Hook to track a profile view without loading the profile
 * Useful for profile preview cards, user mentions, etc.
 */
export const useTrackProfileView = async ({ userId }: { userId: string }) => {
  try {
    const response = await trackProfileViewService(userId);
    return response;
  } catch (error) {
    return null;
  }
};
