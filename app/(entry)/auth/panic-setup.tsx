import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { CallIncoming, Profile, Sms, TickCircle } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const PanicSetup = () => {
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
            <ThemedView>
              <BackButton />
              <ThemedText marginTop={20} fontSize={30}>
                Setting up extra Security
              </ThemedText>
              <ThemedText marginTop={7}>
                Make sure the phone number you enter is registered on WhatsApp.
              </ThemedText>
            </ThemedView>

            <InputField
              icon={<CallIncoming color="#ddd" size={20} />}
              placeholder="+1 234 567 8900"
              label="Emergency Contact"
            />

            <ThemedView
              width={"30%"}
              justifyContent="flex-end"
              alignSelf="flex-end"
              marginTop={20}
            >
              <NativeButton
                href={"/auth/thank-you"}
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

export default PanicSetup;

const styles = StyleSheet.create({});
