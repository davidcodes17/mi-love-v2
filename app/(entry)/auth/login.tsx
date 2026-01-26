import React, { useEffect, useState } from "react";
import { SafeAreaView, Image, TouchableOpacity, Platform } from "react-native";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import { CloseCircle, Lock, Sms } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import InputField from "@/components/common/input-field";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { LoginPayLoad } from "@/types/auth.types";
import * as Yup from "yup";
import {
  loginServiceProxy,
  useNotificationService,
  useGetProfile,
} from "@/hooks/auth-hooks.hooks";
import { ValidationError } from "yup";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "@/components/lib/toast-manager";
import { useUserStore } from "@/store/store";
import { Link } from "expo-router";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { registerForPushNotificationsAsync } from "@/utils/fcm-token.utils";
import {
  requestCameraPermission,
  requestImageLibraryPermission,
} from "@/utils/permissions-utils.utils";

const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const LoginScreen = () => {
  const [data, setData] = useState<LoginPayLoad>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUserStore();

  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        // If user is already in store, they're logged in
        if (token && user) {
          router.replace("/home");
          return;
        }

        // If token exists but user not in store, validate token
        if (token && !user) {
          try {
            const profileData = await useGetProfile();
            if (profileData?.data && !profileData?.error) {
              // Valid token, set user and redirect
              setUser(profileData.data);
              router.replace("/home");
              return;
            } else {
              // Invalid token, clear it (will show login screen)
              await AsyncStorage.removeItem("token");
            }
          } catch (err) {
            // Token invalid, clear it
            await AsyncStorage.removeItem("token");
          }
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Register for push notifications and request other permissions
    const requestInitialPermissions = async () => {
      // Push notifications
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
      }

      // Camera and Photo Library permissions
      // We don't necessarily need to block on these, just trigger them
      await requestCameraPermission(false);
      await requestImageLibraryPermission(false);
    };

    requestInitialPermissions();

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);


  const handleLogin = async () => {
    try {
      await loginSchema.validate(data, { abortEarly: false });
      setLoading(true);

      const response = await loginServiceProxy({ data });

      setLoading(false);

      if (response?.access_token) {
        toast.success("Login successful!");

        console.log(response);
        // Save token
        await AsyncStorage.setItem("token", response?.access_token);

        // Fetch and set user profile for seamless experience
        try {
          const profileData = await useGetProfile();
          if (profileData?.data && !profileData?.error) {
            setUser(profileData.data);
          }
        } catch (profileErr) {
          console.error("Failed to fetch profile after login:", profileErr);
          // Continue anyway, profile will be fetched on home screen
        }

        // Send FCM token after authentication
        if (expoPushToken) {
          try {
            await useNotificationService({ token: expoPushToken });
            console.log("✅ FCM token sent after login");
          } catch (fcmError) {
            console.error("Failed to send FCM token:", fcmError);
            // Don't block login if FCM fails
          }
        } else {
          // If token not ready yet, try to get it and send
          registerForPushNotificationsAsync().then(async (token) => {
            if (token) {
              try {
                await useNotificationService({ token });
                console.log("✅ FCM token sent after login (delayed)");
              } catch (fcmError) {
                console.error("Failed to send FCM token (delayed):", fcmError);
              }
            }
          });
        }

        router.replace("/home");
        return;
      } else {
        toast.error(response?.message || "Login failed");
      }
    } catch (error) {
      setLoading(false);

      if (error instanceof ValidationError) {
        const firstError = error.errors?.[0] || "Invalid input";
        toast.error(firstError);
      } else {
        console.error("Login Error:", error);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const offsetY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    offsetY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <ThemedView padding={20}>
          <BackButton />
          <ThemedText marginTop={20} fontSize={30}>
            Login
          </ThemedText>
          <ThemedText marginTop={7}>
            By logging in, you agree to our Terms of Use.
          </ThemedText>

          <InputField
            icon={<Sms color="#ddd" size={20} />}
            placeholder="you@gmail.com"
            keyboardType="email-address"
            label="Email Address"
            value={data.email}
            onChangeText={(e) => setData((prev) => ({ ...prev, email: e }))}
          />
          <InputField
            icon={<Lock color="#ddd" size={20} />}
            placeholder="••••••••"
            secureTextEntry
            label="Password"
            value={data.password}
            onChangeText={(e) => setData((prev) => ({ ...prev, password: e }))}
          />

          <Link style={{ marginTop: 20 }} href={"/auth/forgot-password"}>
            <ThemedText
              textAlign="right"
              fontSize={15}
              weight="semibold"
              marginTop={10}
            >
              Forgotten Password?
            </ThemedText>
          </Link>

          <NativeButton
            text={"Login"}
            mode="fill"
            isLoading={loading}
            style={{ borderRadius: 100, marginTop: 20 }}
            onPress={handleLogin}
            disabled={loading}
          />

          {/* <ThemedText paddingVertical={20} textAlign="center">
            Or
          </ThemedText>

          <TouchableOpacity
            onPress={() => {
              router.push("/home");
            }}
          >
            <ThemedView
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
              gap={10}
              borderWidth={1}
              borderColor={"#ddd"}
              paddingVertical={15}
              borderRadius={100}
            >
              <Image
                source={require("@/assets/images/google.png")}
                style={{ width: 20, height: 20 }}
              />
              <ThemedText fontSize={15}>Sign In with Google</ThemedText>
            </ThemedView>
          </TouchableOpacity> */}
        </ThemedView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LoginScreen;
