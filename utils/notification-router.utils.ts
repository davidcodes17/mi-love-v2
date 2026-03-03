import { Notification } from "@/services/notification-service.service";

/**
 * Handle notification navigation based on type
 * This function determines where to navigate when a user taps a notification
 */
export const handleNotificationNavigation = (
  notification: Notification,
  navigation: any
) => {
  try {
    const { type, data = {} } = notification;

    switch (type) {
      case "message":
        // Navigate to chat screen with specific chat ID
        if (data?.chatId) {
          navigation.navigate("Chat", {
            chatId: data.chatId,
          });
        } else {
          // Fallback to chats list
          navigation.navigate("(chats)", {
            screen: "chats",
          });
        }
        break;

      case "social":
        // Navigate to profile, friends, or post based on data
        if (data?.userId) {
          navigation.navigate("(friends)", {
            screen: "view-friends",
            params: { userId: data.userId },
          });
        } else if (data?.postId) {
          navigation.navigate("(home)", {
            screen: "home",
          });
        } else {
          // Fallback to friends screen
          navigation.navigate("(friends)", {
            screen: "view-friends",
          });
        }
        break;

      case "system":
        // Handle system notifications (rewards, wallet updates, etc.)
        if (data?.action === "claim_reward") {
          navigation.navigate("(settings)", {
            screen: "wallet",
            params: { claimReward: true },
          });
        } else {
          navigation.navigate("(notifications)", {
            screen: "notifications",
          });
        }
        break;

      case "security":
        // Navigate to security settings
        navigation.navigate("(settings)", {
          screen: "settings",
          params: { tab: "security" },
        });
        break;

      default:
        // Default: show notifications screen
        navigation.navigate("(notifications)", {
          screen: "notifications",
        });
    }
  } catch (error) {
    console.error("Error navigating from notification:", error);
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
    console.error("Error formatting notification time:", error);
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
