import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  View,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import globalStyles from "@/components/styles/global-styles";
import NativeButton from "@/components/ui/native-button";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetProfile, useUserProfileStore } from "@/hooks/auth-hooks.hooks";
import { useUserStore } from "@/store/store";
import { COLORS } from "@/config/theme";

const Onboarding = () => {
  const router = useRouter();
  const scheme = useColorScheme() || "dark";
  const [checkingAuth, setCheckingAuth] = useState(true);
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const { setUser } = useUserStore();

  const logoOpacity = useSharedValue(0);
  const imageTranslateY = useSharedValue(100);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800 });
    imageTranslateY.value = withDelay(300, withTiming(0, { duration: 1000 }));
    textOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: imageTranslateY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          // No token, show onboarding
          setCheckingAuth(false);
          return;
        }

        // Token exists, validate it by fetching profile
        try {
          const profileData = await useGetProfile();

          if (profileData?.data && !profileData?.error) {
            // Token is valid, set user data and navigate to home
            setProfile(profileData.data);
            setUser(profileData.data);
            router.replace("/home");
            return;
          } else {
            // Token is invalid, clear it and show onboarding
            await AsyncStorage.removeItem("token");
            setCheckingAuth(false);
            return;
          }
        } catch (profileError: any) {
          // Profile fetch failed (token invalid or expired)
          console.log("Token validation failed:", profileError);

          // Clear invalid token
          await AsyncStorage.removeItem("token");
          setCheckingAuth(false);
          return;
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading screen while checking authentication
  if (checkingAuth) {
    return (
      <SafeAreaView style={[globalStyles.wrapper, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <ThemedView alignItems="center" justifyContent="center">
          <Image
            source={require("@/assets/images/onboarding/icon.png")}
            style={{ width: 80, height: 80, marginBottom: 20 }}
          />
          {/* <ActivityIndicator size="large" color={COLORS.primary} /> */}
          <ThemedText marginTop={20} fontSize={16} color="#6B7280">
            Loading...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.wrapper, { flex: 1, paddingTop: 40 }]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 40 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          <Animated.View style={logoStyle}>
            <ThemedView
              flexDirection="row"
              gap={10}
              alignItems="center"
              justifyContent="center"
            >
              <Image
                source={require("@/assets/images/onboarding/icon.png")}
                style={{ width: 50, height: 50, alignSelf: "center", borderRadius: 200 }}
              />
              <ThemedText weight="medium" fontSize={25}>
                Mi Love
              </ThemedText>
            </ThemedView>
          </Animated.View>

          <ThemedView justifyContent="center" flex={1} padding={20}>
            <Animated.Image
              source={require("@/assets/pic.jpg")}
              style={[
                {
                  width: "100%",
                  height: 400,
                  borderRadius: 30,
                  alignSelf: "center",
                },
                imageStyle,
              ]}
              resizeMode="cover"
            />

            <Animated.View style={textStyle}>
              <ThemedText
                fontSize={10}
                marginBottom={-10}
                paddingTop={20}
                weight="medium"
                textAlign="center"
              >
                Set up your profile in minutes and let your personality shine.
              </ThemedText>

              <ThemedText
                weight="bold"
                padding={10}
                fontSize={45}
                textAlign="center"
              >
                Match. Chat. Connect.
              </ThemedText>

              <ThemedView
                paddingTop={20}
                flexDirection="row"
                gap={10}
                justifyContent="center"
              >
                <NativeButton
                  href="/auth/login"
                  style={{ width: "40%", borderRadius: 100 }}
                  text="Login"
                  mode="fill"
                />
                <NativeButton
                  href="/auth/create-account"
                  style={{ width: "40%", borderRadius: 100 }}
                  text="Create Account"
                  mode="outline"
                />
              </ThemedView>
            </Animated.View>
          </ThemedView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Onboarding;
