import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { Lock, Lock1 } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

const SetupPassword = () => {
  const offsetY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    offsetY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.exp),
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
            <BackButton />
            <ThemedText marginTop={20} fontSize={30}>
              Security Setup
            </ThemedText>
            <ThemedText marginTop={7}>
              Create an account by filling out the form below.
            </ThemedText>

            <InputField
              icon={<Lock color="#ddd" size={20} />}
              placeholder="Shhh! Keep it secret"
              label="Password"
            />
            <InputField
              icon={<Lock1 color="#ddd" size={20} />}
              placeholder="* * * * * * * * * * * * * * * * * * * * * * *"
              label="Are you sure? Let's see"
            />

            <ThemedView
              width={"30%"}
              justifyContent="flex-end"
              alignSelf="flex-end"
              marginTop={20}
            >
              <NativeButton
                href={"/home"}
                text={"Next"}
                mode="fill"
                style={{ borderRadius: 100 }}
              />
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SetupPassword;

const styles = StyleSheet.create({});
