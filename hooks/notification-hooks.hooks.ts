import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { handleNotificationNavigation } from "@/utils/notification-router.utils";
import { Notification } from "@/services/notification-service.service";
import { incrementBadgeCount } from "@/utils/badge-utils.utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "@/services/auth-service.service";
import { useUserStore } from "@/store/store";

/**
 * Hook to set up notification listeners for foreground and background
 */
export const useNotificationListeners = () => {
  const router = useRouter();
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
        incrementBadgeCount();
      });

    const navigateFromResponse = (response: Notifications.NotificationResponse) => {
      const content = response.notification.request.content;
      const data = content.data ?? {};
      const notificationObj = {
        ...data,
        id: String(data.id ?? response.notification.request.identifier ?? ""),
        title: String(data.title ?? content.title ?? ""),
        body: String(data.body ?? content.body ?? ""),
        type: String(data.type ?? (data.data as any)?.type ?? "system"),
        is_read: false,
        created_at: String(data.created_at ?? new Date().toISOString()),
        updated_at: String(data.updated_at ?? new Date().toISOString()),
        data,
      } as Notification;
      handleNotificationNavigation(notificationObj, router);
    };

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) navigateFromResponse(response);
    });
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(navigateFromResponse);

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
  }, [router]);
};

/**
 * Hook to handle deep links for reward claims and other app links
 */
export const useDeepLinkHandler = () => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    // Handle deep link that opened the app
    Linking.getInitialURL().then((url) => {
      if (url != null) {
        handleDeepLink(url, router, setUser);
      }
    });

    // Listen for deep links while app is running
    const listener = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url, router, setUser);
    });

    return () => {
      listener.remove();
    };
  }, [router, setUser]);
};

/**
 * Handle deep link navigation
 */
export async function handleDeepLink(
  url: string,
  router: any,
  setUser?: (user: any) => void
) {
  try {
    const { hostname, path, queryParams } = Linking.parse(url);
    const routePath = [hostname, path].filter(Boolean).join("/").replace(/\/+/g, "/");
    const value = (key: string) => {
      const result = queryParams?.[key];
      return Array.isArray(result) ? result[0] : result;
    };

    if (routePath === "auth/login" || routePath.endsWith("/auth/login")) {
      const token = value("token") || value("access_token") || value("accessToken");
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      await AsyncStorage.setItem("token", String(token));
      const profileResponse = await getProfile();
      const profile =
        profileResponse?.data?.user ??
        profileResponse?.data ??
        profileResponse?.user ??
        profileResponse;
      if (profile && !profile.error && setUser) setUser(profile);
      router.replace("/home");
    } else if (routePath.includes("payment/callback") || routePath.includes("payment-callback")) {
      router.replace({
        pathname: "/payment-callback",
        params: {
          status: value("status") ?? "pending",
          transactionId: value("transactionId") ?? value("transaction_id"),
          reference: value("reference") ?? value("tx_ref"),
        },
      });
    } else if (path === "claim-reward" || hostname === "claim-reward") {
      const token = queryParams?.token;
      if (token) {
        router.push({
          pathname: "/(settings)/wallet",
          params: { claimRewardToken: token },
        });
      }
    } else if (routePath === "chat" || routePath.startsWith("chat/")) {
      const chatId = value("chatId") || value("id") || routePath.split("/")[1];
      if (chatId) {
        router.push({
          pathname: "/(chats)/chats",
          params: { id: chatId },
        });
      }
    } else if (path === "profile" || hostname === "profile") {
      const userId = queryParams?.userId || queryParams?.id;
      if (userId) {
        router.push({
          pathname: "/(friends)/view-friends",
          params: { userId },
        });
      }
    } else if (
      path === "post" ||
      hostname === "post" ||
      path?.startsWith("post/")
    ) {
      const postId =
        (path?.startsWith("post/") ? path.split("/")[1] : null) ||
        queryParams?.postId ||
        queryParams?.id ||
        (hostname === "post" ? path : null);
      const commentId = queryParams?.commentId;
      if (postId) {
        router.push({
          pathname: "/post/[id]",
          params: { id: postId, commentId },
        });
      }
    }
  } catch (error) {
  }
}
