import { Platform, Alert, Linking, PermissionsAndroid } from "react-native";
import * as Audio from "expo-av";
import * as Camera from "expo-camera";

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
}

/**
 * Request camera and microphone permissions
 * @param showAlert - Whether to show an alert if permissions are denied
 * @returns Object with camera and microphone permission status
 */
export async function requestCallPermissions(
  showAlert: boolean = true
): Promise<PermissionStatus> {
  try {
    let cameraGranted = false;
    let microphoneGranted = false;

    // Request microphone permission (works on both platforms)
    // Use platform-specific APIs directly to avoid native module errors
    if (Platform.OS === "android") {
      try {
        const micPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs access to your microphone to make calls",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        microphoneGranted = micPermission === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.log("Error requesting microphone permission, WebRTC will handle it:", err);
        // For iOS or if permission request fails, assume granted and let WebRTC handle it
        microphoneGranted = true;
      }
    } else {
      // iOS - Use expo-av to request microphone permission
      try {
        // First check current permission status
        try {
          const currentPermission = await Audio.getPermissionsAsync();
          console.log("Current microphone permission status:", currentPermission.status);
          
          if (currentPermission.status === "granted") {
            microphoneGranted = true;
          } else if (currentPermission.status === "undetermined") {
            // Request permission if not determined
            const audioPermission = await Audio.requestPermissionsAsync();
            microphoneGranted = audioPermission.status === "granted";
            console.log("Requested microphone permission, status:", audioPermission.status, "granted:", microphoneGranted);
          } else {
            // Denied or restricted
            microphoneGranted = false;
            console.warn("Microphone permission is denied or restricted");
          }
        } catch (getError: any) {
          // If getPermissionsAsync fails, try requestPermissionsAsync directly
          console.log("getPermissionsAsync failed, trying requestPermissionsAsync directly:", getError?.message);
          const audioPermission = await Audio.requestPermissionsAsync();
          microphoneGranted = audioPermission.status === "granted";
          console.log("Requested microphone permission directly, status:", audioPermission.status, "granted:", microphoneGranted);
        }
      } catch (err: any) {
        const errorMessage = err?.message || String(err);
        console.error("Error requesting microphone permission on iOS:", errorMessage);
        console.error("Full error object:", JSON.stringify(err, null, 2));
        
        // If expo-av fails, check if it's a native module error
        if (errorMessage.includes("native module") || 
            errorMessage.includes("not found") ||
            errorMessage.includes("Cannot find native module") ||
            err?.code === "ERR_MODULE_NOT_FOUND" ||
            errorMessage.includes("expo-av")) {
          console.warn("expo-av native module not available, WebRTC will handle permissions");
          microphoneGranted = true; // Let WebRTC handle it
        } else {
          // For other errors, assume not granted
          console.warn("Microphone permission request failed, assuming not granted");
          microphoneGranted = false;
        }
      }
    }

    // Request camera permission - platform specific
    if (Platform.OS === "android") {
      try {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to make video calls",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        cameraGranted = cameraPermission === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error("Error requesting camera permission on Android:", err);
        cameraGranted = false;
      }
    } else {
      // iOS - Use expo-camera to request camera permission
      try {
        // First check current permission status
        try {
          const currentPermission = await Camera.getCameraPermissionsAsync();
          console.log("Current camera permission status:", currentPermission.status);
          
          if (currentPermission.status === "granted") {
            cameraGranted = true;
          } else if (currentPermission.status === "undetermined") {
            // Request permission if not determined
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            cameraGranted = cameraPermission.status === "granted";
            console.log("Requested camera permission, status:", cameraPermission.status, "granted:", cameraGranted);
          } else {
            // Denied or restricted
            cameraGranted = false;
            console.warn("Camera permission is denied or restricted");
          }
        } catch (getError: any) {
          // If getCameraPermissionsAsync fails, try requestCameraPermissionsAsync directly
          console.log("getCameraPermissionsAsync failed, trying requestCameraPermissionsAsync directly:", getError?.message);
          const cameraPermission = await Camera.requestCameraPermissionsAsync();
          cameraGranted = cameraPermission.status === "granted";
          console.log("Requested camera permission directly, status:", cameraPermission.status, "granted:", cameraGranted);
        }
      } catch (err: any) {
        const errorMessage = err?.message || String(err);
        console.error("Error requesting camera permission on iOS:", errorMessage);
        console.error("Full error object:", JSON.stringify(err, null, 2));
        
        // If expo-camera fails, check if it's a native module error
        if (errorMessage.includes("native module") || 
            errorMessage.includes("not found") ||
            errorMessage.includes("Cannot find native module") ||
            err?.code === "ERR_MODULE_NOT_FOUND" ||
            errorMessage.includes("expo-camera")) {
          console.warn("expo-camera native module not available, WebRTC will handle permissions");
          cameraGranted = true; // Let WebRTC handle it
        } else {
          // For other errors, assume not granted
          console.warn("Camera permission request failed, assuming not granted");
          cameraGranted = false;
        }
      }
    }

    // If permissions are denied, show alert
    if (showAlert && (!cameraGranted || !microphoneGranted)) {
      const deniedPermissions: string[] = [];
      if (!cameraGranted) deniedPermissions.push("Camera");
      if (!microphoneGranted) deniedPermissions.push("Microphone");

      Alert.alert(
        "Permissions Required",
        `Please grant ${deniedPermissions.join(" and ")} permission to make calls. You can enable it in Settings.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }

    return {
      camera: cameraGranted,
      microphone: microphoneGranted,
    };
  } catch (error) {
    console.error("Error requesting permissions:", error);
    return {
      camera: false,
      microphone: false,
    };
  }
}

/**
 * Check current permission status without requesting
 */
export async function checkCallPermissions(): Promise<PermissionStatus> {
  try {
    let cameraGranted = false;
    
    // Check microphone permission - use platform-specific APIs
    let microphoneGranted = false;
    if (Platform.OS === "android") {
      try {
        microphoneGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
      } catch (err) {
        microphoneGranted = true; // Assume granted, let WebRTC handle it
      }
    } else {
      microphoneGranted = true; // iOS - WebRTC will handle it
    }

    // Check camera permission - platform specific
    if (Platform.OS === "android") {
      try {
        const cameraPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        cameraGranted = cameraPermission;
      } catch (err) {
        console.error("Error checking camera permission on Android:", err);
        cameraGranted = false;
      }
    } else {
      // iOS - assume granted for now, WebRTC will handle it
      cameraGranted = true;
    }

    return {
      camera: cameraGranted,
      microphone: microphoneGranted,
    };
  } catch (error) {
    console.error("Error checking permissions:", error);
    return {
      camera: false,
      microphone: false,
    };
  }
}

/**
 * Request only microphone permission (for audio calls)
 */
export async function requestMicrophonePermission(
  showAlert: boolean = true
): Promise<boolean> {
  try {
    let granted = false;
    
    // Use platform-specific APIs directly to avoid native module errors
    if (Platform.OS === "android") {
      try {
        const micPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs access to your microphone to make calls",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        granted = micPermission === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.log("Error requesting microphone permission, WebRTC will handle it:", err);
        // For iOS or if permission request fails, assume granted and let WebRTC handle it
        granted = true;
      }
    } else {
      // iOS - Use expo-av to request microphone permission
      try {
        // First check current permission status
        try {
          const currentPermission = await Audio.getPermissionsAsync();
          console.log("Current microphone permission status:", currentPermission.status);
          
          if (currentPermission.status === "granted") {
            granted = true;
          } else if (currentPermission.status === "undetermined") {
            // Request permission if not determined
            const audioPermission = await Audio.requestPermissionsAsync();
            granted = audioPermission.status === "granted";
            console.log("Requested microphone permission, status:", audioPermission.status, "granted:", granted);
          } else {
            // Denied or restricted
            granted = false;
            console.warn("Microphone permission is denied or restricted");
          }
        } catch (getError: any) {
          // If getPermissionsAsync fails, try requestPermissionsAsync directly
          console.log("getPermissionsAsync failed, trying requestPermissionsAsync directly:", getError?.message);
          const audioPermission = await Audio.requestPermissionsAsync();
          granted = audioPermission.status === "granted";
          console.log("Requested microphone permission directly, status:", audioPermission.status, "granted:", granted);
        }
      } catch (err: any) {
        const errorMessage = err?.message || String(err);
        console.error("Error requesting microphone permission on iOS:", errorMessage);
        console.error("Full error object:", JSON.stringify(err, null, 2));
        
        // If expo-av fails, check if it's a native module error
        if (errorMessage.includes("native module") || 
            errorMessage.includes("not found") ||
            errorMessage.includes("Cannot find native module") ||
            err?.code === "ERR_MODULE_NOT_FOUND" ||
            errorMessage.includes("expo-av")) {
          console.warn("expo-av native module not available, WebRTC will handle permissions");
          granted = true; // Let WebRTC handle it
        } else {
          // For other errors, assume not granted
          console.warn("Microphone permission request failed, assuming not granted");
          granted = false;
        }
      }
    }

    if (showAlert && !granted) {
      Alert.alert(
        "Microphone Permission Required",
        "Please grant microphone permission to make audio calls. You can enable it in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }

    return granted;
  } catch (error) {
    console.error("Error requesting microphone permission:", error);
    // If all else fails, assume granted and let WebRTC handle it
    return true;
  }
}

/**
 * Request only camera permission (for video calls)
 */
export async function requestCameraPermission(
  showAlert: boolean = true
): Promise<boolean> {
  try {
    let granted = false;

    if (Platform.OS === "android") {
      try {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to make video calls",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        granted = cameraPermission === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error("Error requesting camera permission on Android:", err);
        granted = false;
      }
    } else {
      // iOS - Use expo-camera to request camera permission
      try {
        // First check current permission status
        try {
          const currentPermission = await Camera.getCameraPermissionsAsync();
          console.log("Current camera permission status:", currentPermission.status);
          
          if (currentPermission.status === "granted") {
            granted = true;
          } else if (currentPermission.status === "undetermined") {
            // Request permission if not determined
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            granted = cameraPermission.status === "granted";
            console.log("Requested camera permission, status:", cameraPermission.status, "granted:", granted);
          } else {
            // Denied or restricted
            granted = false;
            console.warn("Camera permission is denied or restricted");
          }
        } catch (getError: any) {
          // If getCameraPermissionsAsync fails, try requestCameraPermissionsAsync directly
          console.log("getCameraPermissionsAsync failed, trying requestCameraPermissionsAsync directly:", getError?.message);
          const cameraPermission = await Camera.requestCameraPermissionsAsync();
          granted = cameraPermission.status === "granted";
          console.log("Requested camera permission directly, status:", cameraPermission.status, "granted:", granted);
        }
      } catch (err: any) {
        const errorMessage = err?.message || String(err);
        console.error("Error requesting camera permission on iOS:", errorMessage);
        console.error("Full error object:", JSON.stringify(err, null, 2));
        
        // If expo-camera fails, check if it's a native module error
        if (errorMessage.includes("native module") || 
            errorMessage.includes("not found") ||
            errorMessage.includes("Cannot find native module") ||
            err?.code === "ERR_MODULE_NOT_FOUND" ||
            errorMessage.includes("expo-camera")) {
          console.warn("expo-camera native module not available, WebRTC will handle permissions");
          granted = true; // Let WebRTC handle it
        } else {
          // For other errors, assume not granted
          console.warn("Camera permission request failed, assuming not granted");
          granted = false;
        }
      }
    }

    if (showAlert && !granted) {
      Alert.alert(
        "Camera Permission Required",
        "Please grant camera permission to make video calls. You can enable it in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }

    return granted;
  } catch (error) {
    console.error("Error requesting camera permission:", error);
    return false;
  }
}

