import apiSecured from "@/security/api-secured";

/**
 * Notification type definitions
 */
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "message" | "security" | "system" | "social";
  is_read: boolean;
  created_at: string;
  updated_at: string;
  data?: Record<string, any>;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Fetch notifications with pagination
 */
export const fetchNotificationsService = async (
  page = 1,
  limit = 20
): Promise<NotificationsResponse | any> => {
  try {
    const response = await apiSecured.get("/notifications", {
      params: { page, limit },
      skipToast: true, // Silent operation
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error);
    return error?.response?.data || { error: "Failed to fetch notifications" };
  }
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsReadService = async (
  notificationId: string
): Promise<any> => {
  try {
    const response = await apiSecured.patch(
      `/notifications/${notificationId}/read`,
      {}
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to mark notification as read:", error);
    return error?.response?.data || { error: "Failed to mark as read" };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsReadService = async (): Promise<any> => {
  try {
    const response = await apiSecured.patch("/notifications/read-all", {});
    return response.data;
  } catch (error: any) {
    console.error("Failed to mark all notifications as read:", error);
    return error?.response?.data || { error: "Failed to mark all as read" };
  }
};

/**
 * Delete a notification
 */
export const deleteNotificationService = async (
  notificationId: string
): Promise<any> => {
  try {
    const response = await apiSecured.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete notification:", error);
    return error?.response?.data || { error: "Failed to delete notification" };
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCountService = async (): Promise<number> => {
  try {
    const response = await apiSecured.get("/notifications/unread-count", {
      skipToast: true,
    });
    return response.data?.count || 0;
  } catch (error: any) {
    console.error("Failed to get unread count:", error);
    return 0;
  }
};
