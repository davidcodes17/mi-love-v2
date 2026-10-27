import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from "react-native-reanimated";

interface LoadingScreenProps {
  message?: string;
}

/** Mi Love brand splash shown while the app restores a session. */
export default function LoadingScreen({
  message = "",
}: LoadingScreenProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, {
          duration: 900,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 900,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={["#F07B68", "#B8325B"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.glyph}
          >
            <View style={styles.glyphInner}>
              <Ionicons name="heart" size={40} color="#fff" />
            </View>
          </LinearGradient>
        </Animated.View>
        {!!message && (
          <Animated.Text entering={FadeIn} style={styles.message}>
            {message}
          </Animated.Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.from}>from</Text>
        <Text style={styles.brand}>mi love</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff9f5",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  glyphInner: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 28,
    fontSize: 14,
    color: "#806f78",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 48,
    gap: 2,
  },
  from: {
    fontSize: 12,
    color: "#806f78",
  },
  brand: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: "#281a22",
  },
});
