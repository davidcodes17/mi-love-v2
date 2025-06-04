import React, { useEffect } from "react";
import { SafeAreaView, Image } from "react-native";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import { Lock, Sms } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import InputField from "@/components/common/input-field";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";

const LoginScreen = () => {
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
          <ThemedView>
            <BackButton />
            <ThemedText marginTop={20} fontSize={30}>
              Login
            </ThemedText>
            <ThemedText marginTop={7}>
              By logging in, you agree to our Terms of Use.
            </ThemedText>
          </ThemedView>

          <InputField
            icon={<Sms color="#ddd" size={20} />}
            placeholder="you@gmail.com"
            label="Email Address"
          />
          <InputField
            icon={<Lock color="#ddd" size={20} />}
            placeholder="* * * * * * * * * * * * * * * * * * * * *"
            label="Password"
          />

          <ThemedText textAlign="right" weight="semibold" marginTop={10}>
            Forgotten Password?
          </ThemedText>

          <ThemedView>
            <NativeButton
              text={"Login"}
              mode="fill"
              style={{
                borderRadius: 100,
                marginTop: 20,
              }}
              href={"/home"}
            />
          </ThemedView>

          <ThemedText paddingVertical={20} textAlign="center">
            Or
          </ThemedText>

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
              style={{
                width: 20,
                height: 20,
              }}
            />
            <ThemedText fontSize={15}>Sign In with Google</ThemedText>
          </ThemedView>
        </ThemedView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LoginScreen;
