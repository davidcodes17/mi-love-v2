import React, { useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from "react-native";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { height } = Dimensions.get("window");

const ThankYou = () => {
  const offsetY = useSharedValue(30);
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
      <Animated.View style={[styles.container, animatedStyle]}>
        <ThemedText fontSize={34} fontWeight="bold" textAlign="center">
          🎉 Thank You!
        </ThemedText>
        <ThemedText
          marginTop={10}
          fontSize={16}
          color="#888"
          textAlign="center"
        >
          Your information has been submitted successfully.
        </ThemedText>

        <ThemedView
          width={"60%"}
          justifyContent="center"
          alignSelf="center"
          marginTop={40}
        >
          <NativeButton
            href={"/home"}
            text={"Go Home"}
            mode="fill"
            style={{
              borderRadius: 100,
            }}
          />
        </ThemedView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ThankYou;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
