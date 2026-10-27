import apiSecured from "@/security/api-secured";

/**
 * Notification type definitions
 */
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "message" | "like" | "comment" | "security" | "system" | "social";
  is_read: boolean;
  created_at: string;
  updated_at: string;
  data?: Record<string, any>;
}

export interface NotificationDevicePayload {
  token: string;
  deviceId: string;
  platform: string;
  metadata?: Record<string, unknown>;
}

const normalizeNotification = (item: any): Notification => ({
  ...item,
  id: String(item?.id ?? item?.notificationId ?? ""),
  title: String(item?.title ?? item?.notification?.title ?? ""),
  body: String(item?.body ?? item?.message ?? item?.notification?.body ?? ""),
  type: item?.type ?? item?.notificationType ?? item?.data?.type ?? "system",
  is_read: Boolean(item?.is_read ?? item?.isRead ?? item?.read),
  created_at: item?.created_at ?? item?.createdAt ?? new Date().toISOString(),
  updated_at: item?.updated_at ?? item?.updatedAt ?? item?.created_at ?? new Date().toISOString(),
  data: item?.data ?? item?.payload ?? {},
});

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
    const payload = response.data?.data ?? response.data;
    const items = Array.isArray(payload)
      ? payload
      : payload?.data ?? payload?.notifications ?? [];
    const rawMeta = response.data?.meta ?? payload?.meta ?? {};
    return {
      data: items.map(normalizeNotification),
      meta: {
        page: Number(rawMeta.page ?? rawMeta.currentPage ?? page),
        limit: Number(rawMeta.limit ?? rawMeta.itemsPerPage ?? limit),
        totalItems: Number(rawMeta.totalItems ?? rawMeta.total ?? items.length),
        totalPages: Number(rawMeta.totalPages ?? rawMeta.lastPage ?? 1),
      },
    };
  } catch (error: any) {
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
    const response = await apiSecured.post(
      `/notifications/${notificationId}/read`,
      {}
    );
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { error: "Failed to mark as read" };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsReadService = async (): Promise<any> => {
  try {
    const response = await apiSecured.post("/notifications/read-all", {});
    return response.data;
  } catch (error: any) {
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
    return Number(
      response.data?.count ??
        response.data?.data?.count ??
        response.data?.unreadCount ??
        0
    );
  } catch (error: any) {
    return 0;
  }
};

export const registerNotificationDeviceService = async (
  data: NotificationDevicePayload
) => {
  try {
    const response = await apiSecured.post("/notifications/devices", data);
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { error: "Failed to register device" };
  }
};

export const unregisterNotificationDeviceService = async (deviceId: string) => {
  try {
    const response = await apiSecured.delete(
      `/notifications/devices/${encodeURIComponent(deviceId)}`
    );
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { error: "Failed to unregister device" };
  }
};

export const updateNotificationPreferencesService = async (
  preferences: Record<string, boolean>
) => {
  try {
    const response = await apiSecured.patch(
      "/notifications/preferences",
      preferences
    );
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { error: "Failed to update preferences" };
  }
};
