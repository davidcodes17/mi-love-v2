import React, { useEffect, useState } from "react";
import { SafeAreaView, Image, TouchableOpacity } from "react-native";
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
import { loginServiceProxy } from "@/hooks/auth-hooks.hooks";
import { ValidationError } from "yup";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import toast from "@originaltimi/rn-toast";

const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginScreen = () => {
  const [data, setData] = useState<LoginPayLoad>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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

          <ThemedText textAlign="right" weight="semibold" marginTop={10}>
            Forgotten Password?
          </ThemedText>

          <NativeButton
            text={loading ? "Logging in..." : "Login"}
            mode="fill"
            style={{ borderRadius: 100, marginTop: 20 }}
            onPress={handleLogin}
            disabled={loading}
          />

          <ThemedText paddingVertical={20} textAlign="center">
            Or
          </ThemedText>

          <TouchableOpacity onPress={()=>{
            router.push("/home")
          }}>
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
          </TouchableOpacity>
        </ThemedView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LoginScreen;
