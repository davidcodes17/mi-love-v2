import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  registerNotificationDeviceService,
  unregisterNotificationDeviceService,
  updateNotificationPreferencesService,
} from "@/services/notification-service.service";

const FCM_TOKEN_STORAGE_KEY = "fcm_token_sent";
const DEVICE_ID_STORAGE_KEY = "notification_device_id";

export async function getStableNotificationDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;

  const id = `${Platform.OS}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
  await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  return id;
}

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
      return null;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      
      if (!projectId) {
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      token = tokenData.data;
    } catch (e) {
      return null;
    }
  } else {
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
      return false;
    }

    // Check if we've already sent this token
    const deviceId = await getStableNotificationDeviceId();
    const registrationKey = `${deviceId}:${token}`;
    const lastSentToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    if (lastSentToken === registrationKey) {
      return true;
    }

    const response = await registerNotificationDeviceService({
      token,
      deviceId,
      platform: Platform.OS,
      metadata: {
        deviceName: Device.deviceName,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        appVersion: Constants.expoConfig?.version,
      },
    });

    if (response && !response.error) {
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, registrationKey);
      return true;
    } else {
      return false;
    }
  } catch (error) {
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
      return false;
    }

    // Send token to server
    const sent = await sendFcmTokenToServer(token);
    
    if (!sent) {
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await sendFcmTokenToServer(token);
    }

    return sent;
  } catch (error) {
    return false;
  }
}

/**
 * Clear stored FCM token (useful on logout)
 */
export async function clearFcmToken(): Promise<void> {
  await AsyncStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
}

export async function unregisterPushNotificationDevice(): Promise<boolean> {
  try {
    const deviceId = await getStableNotificationDeviceId();
    const response = await unregisterNotificationDeviceService(deviceId);
    if (response?.error) return false;
    await clearFcmToken();
    return true;
  } catch {
    return false;
  }
}

export async function updatePushNotificationPreferences(
  preferences: Record<string, boolean>
) {
  return updateNotificationPreferencesService(preferences);
}

