import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { handleNotificationNavigation } from "@/utils/notification-router.utils";
import { Notification } from "@/services/notification-service.service";

/**
 * Hook to set up notification listeners for foreground and background
 */
export const useNotificationListeners = () => {
  const navigation = useNavigation();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Configure how notifications are displayed when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Foreground notification received:", notification);
        // You can add custom logic here (show in-app banner, etc.)
      });

    // Listen for user tapping on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification response received:", response);

        const data = response.notification.request.content.data;

        // If notification has the required fields, navigate
        if (data && typeof data === "object") {
          try {
            const notificationObj = {
              id: (data.id as string) || "",
              title: (data.title as string) || "",
              body: (data.body as string) || "",
              type: (data.type as "message" | "security" | "system" | "social") || "system",
              is_read: (data.is_read as boolean) || false,
              created_at: (data.created_at as string) || new Date().toISOString(),
              updated_at: (data.updated_at as string) || new Date().toISOString(),
              data: (data.data as Record<string, any>) || {},
            } as Notification;

            handleNotificationNavigation(notificationObj, navigation);
          } catch (error) {
            console.error("Error handling notification response:", error);
          }
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [navigation]);
};

/**
 * Hook to handle deep links for reward claims and other app links
 */
export const useDeepLinkHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle deep link that opened the app
    Linking.getInitialURL().then((url) => {
      if (url != null) {
        handleDeepLink(url, navigation);
      }
    });

    // Listen for deep links while app is running
    const listener = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url, navigation);
    });

    return () => {
      listener.remove();
    };
  }, [navigation]);
};

/**
 * Handle deep link navigation
 */
function handleDeepLink(url: string, navigation: any) {
  try {
    const { hostname, path, queryParams } = Linking.parse(url);

    console.log("🔗 Deep link received:", { hostname, path, queryParams });

    if (path === "claim-reward" || hostname === "claim-reward") {
      const token = queryParams?.token;
      if (token) {
        console.log("🎁 Navigating to reward claim with token:", token);
        navigation.navigate("(settings)", {
          screen: "wallet",
          params: { claimRewardToken: token },
        });
      }
    } else if (path === "chat" || hostname === "chat") {
      const chatId = queryParams?.chatId || queryParams?.id;
      if (chatId) {
        navigation.navigate("(chats)", {
          screen: "chats",
          params: { chatId },
        });
      }
    } else if (path === "profile" || hostname === "profile") {
      const userId = queryParams?.userId || queryParams?.id;
      if (userId) {
        navigation.navigate("(friends)", {
          screen: "view-friends",
          params: { userId },
        });
      }
    }
  } catch (error) {
    console.error("Error handling deep link:", error);
  }
}
