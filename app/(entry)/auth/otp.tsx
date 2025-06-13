import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import { OtpInput } from "react-native-otp-entry";
import NativeButton from "@/components/ui/native-button";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const OTP = () => {
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
      <ScrollView>
        <Animated.View style={[animatedStyle]}>
          <ThemedView padding={20}>
            <ThemedView marginBottom={20}>
              <BackButton />
              <ThemedText marginTop={20} fontSize={30}>
                Verify your email
              </ThemedText>
              <ThemedText marginTop={7}>
                We just sent an email to you with a verification code. Please
                enter the code below to verify your email address.
              </ThemedText>
            </ThemedView>

            <OtpInput
              numberOfDigits={4}
              blurOnFilled={true}
              secureTextEntry
              onTextChange={(text: any) => console.log(text)}
            />

            <ThemedView
              width={"30%"}
              justifyContent="flex-end"
              alignSelf="flex-end"
              marginTop={20}
            >
              <NativeButton
                href={"/auth/panic-setup"}
                text={"Next"}
                mode="fill"
                style={{
                  borderRadius: 100,
                }}
              />
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OTP;

const styles = StyleSheet.create({});
