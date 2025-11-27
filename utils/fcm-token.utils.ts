import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useNotificationService } from "@/hooks/auth-hooks.hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FCM_TOKEN_STORAGE_KEY = "fcm_token_sent";

/**
 * Register for push notifications and get the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "Mi Love Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      console.warn("Failed to get push token - permission not granted");
      return null;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.error("Project ID not found for push notifications");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      token = tokenData.data;
      console.log("✅ FCM Token obtained:", token);
    } catch (e) {
      console.error("Error getting push token:", e);
      return null;
    }
  } else {
    console.warn("Must use physical device for Push Notifications");
    return null;
  }

  return token;
}

/**
 * Send FCM token to the server
 */
export async function sendFcmTokenToServer(token: string): Promise<boolean> {
  try {
    // Check if user is authenticated
    const authToken = await AsyncStorage.getItem("token");
    if (!authToken) {
      console.log("User not authenticated, skipping FCM token send");
      return false;
    }

    // Check if we've already sent this token
    const lastSentToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    if (lastSentToken === token) {
      console.log("FCM token already sent to server");
      return true;
    }

    console.log("📤 Sending FCM token to server:", token);
    const response = await useNotificationService({ token });

    if (response && !response.error) {
      // Save that we've sent this token
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      console.log("✅ FCM token sent successfully");
      return true;
    } else {
      console.error("❌ Failed to send FCM token:", response?.error || response);
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending FCM token:", error);
    return false;
  }
}

/**
 * Register for push notifications and send token to server
 * This is the main function to call after user authentication
 */
export async function registerAndSendFcmToken(): Promise<boolean> {
  try {
    const token = await registerForPushNotificationsAsync();
    
    if (!token) {
      console.warn("No FCM token obtained");
      return false;
    }

    // Send token to server
    const sent = await sendFcmTokenToServer(token);
    
    if (!sent) {
      // Retry once after a short delay
      console.log("Retrying FCM token send...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await sendFcmTokenToServer(token);
    }

    return sent;
  } catch (error) {
    console.error("Error in registerAndSendFcmToken:", error);
    return false;
  }
}

/**
 * Clear stored FCM token (useful on logout)
 */
export async function clearFcmToken(): Promise<void> {
  await AsyncStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  console.log("FCM token cleared");
}

