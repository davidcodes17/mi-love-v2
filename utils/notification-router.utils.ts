import { Notification } from "@/services/notification-service.service";

const parseObject = (value: unknown): Record<string, any> => {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return parseObject(JSON.parse(value));
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? (value as Record<string, any>) : {};
};

export const flattenNotificationPayload = (input: unknown) => {
  const root = parseObject(input);
  const notification = parseObject(root.notification);
  const nested = parseObject(root.data);
  const payload = parseObject(nested.data ?? nested.payload ?? root.payload);
  return { ...notification, ...root, ...nested, ...payload };
};

/**
 * Handle notification navigation based on type
 * This function determines where to navigate when a user taps a notification
 */
export const handleNotificationNavigation = (
  notification: Notification,
  navigation: any
) => {
  try {
    const data = flattenNotificationPayload(notification);
    const type = String(
      data.type ?? data.notificationType ?? notification.type ?? "system"
    ).toLowerCase();
    const push = (pathname: string, params?: Record<string, any>) =>
      navigation.push
        ? navigation.push({ pathname, params })
        : navigation.navigate(pathname, params);

    switch (type) {
      case "message":
      case "chat":
        if (data.chatId || data.chat_id || data.id) {
          push("/(chats)/chats", {
            id: data.chatId ?? data.chat_id ?? data.id,
          });
        } else {
          push("/(home)/inbox");
        }
        break;

      case "social":
      case "like":
      case "comment":
        if (data.postId || data.post_id) {
          push("/post/[id]", {
            id: data.postId ?? data.post_id,
            commentId: data.commentId ?? data.comment_id,
          });
        } else if (data.userId || data.user_id) {
          push("/(friends)/view-friends", {
            userId: data.userId ?? data.user_id,
          });
        } else {
          push("/(notifications)/notifications");
        }
        break;

      case "system":
      case "wallet":
      case "payment":
        if (data.action === "claim_reward" || data.token) {
          push("/(settings)/wallet", {
            claimRewardToken: data.token,
          });
        } else if (data.transactionId || data.transaction_id || data.reference) {
          push("/payment-callback", {
            status: data.status ?? "pending",
            transactionId: data.transactionId ?? data.transaction_id,
            reference: data.reference,
          });
        } else {
          push("/(notifications)/notifications");
        }
        break;

      case "security":
        push("/(notifications)/notifications");
        break;

      default:
        push("/(notifications)/notifications");
    }
  } catch (error) {
  }
};

/**
 * Get notification icon/emoji based on type
 */
export const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    message: "💬",
    social: "👥",
    system: "⚙️",
    security: "🔒",
  };
  return iconMap[type] || "📬";
};

/**
 * Format relative time for notification
 */
export const formatNotificationTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;

    return date.toLocaleDateString();
  } catch (error) {
    return "";
  }
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (
  notifications: Notification[]
): Record<string, Notification[]> => {
  return notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at);
    const dateKey = date.toLocaleDateString();

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);

    return groups;
  }, {} as Record<string, Notification[]>);
};
