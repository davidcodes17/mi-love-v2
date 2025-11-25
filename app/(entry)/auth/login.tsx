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
} from "@/hooks/auth-hooks.hooks";
import { ValidationError } from "yup";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import toast from "@originaltimi/rn-toast";
import { Link } from "expo-router";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

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

  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );

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
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const sendFcm = async () => {
    const response = await useNotificationService({ token: expoPushToken });
    console.log(response, "GETETE")
  };


  const handleLogin = async () => {
    try {
      await loginSchema.validate(data, { abortEarly: false });
      setLoading(true);

      const response = await loginServiceProxy({ data });

      setLoading(false);

      if (response?.access_token) {
        toast({
          title: "Login successful!",
          type: "success",
          position: "top",
          // icon: <CloseCircle color="#000" size={20} />,
          duration: 2,
        });

        console.log(response);
        // e.g., navigate to dashboard
        await AsyncStorage.setItem("token", response?.access_token);
        sendFcm();
        router.push("/home");
        return;
      } else {
        toast({
          title: response?.message || "Login failed",
          type: "error",
          position: "top",
        });
      }
    } catch (error) {
      setLoading(false);

      if (error instanceof ValidationError) {
        const firstError = error.errors?.[0] || "Invalid input";
        toast({
          title: firstError,
          type: "error",
          position: "top",
        });
      } else {
        console.error("Login Error:", error);
        toast({
          title: "Something went wrong. Please try again.",
          type: "error",
          position: "top",
        });
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
        </ThemedView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LoginScreen;

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "A channel is needed for the permissions prompt to appear",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
