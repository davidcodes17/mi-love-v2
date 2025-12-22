import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native";
import React, { useEffect, useRef } from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { router, useLocalSearchParams } from "expo-router";

const Ringing = () => {
  const { id, recipientId, mode } = useLocalSearchParams<{
    id: string;
    recipientId: string;
    mode: "join" | "create";
  }>();

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Caller Info */}
      <View style={styles.center}>
        <Animated.View
          style={[styles.avatarPulse, { transform: [{ scale: pulse }] }]}
        >
          <View style={styles.avatar} />
        </Animated.View>

        <ThemedText
          fontSize={24}
          fontWeight="bold"
          color="white"
          marginTop={20}
        >
          Calling…
        </ThemedText>

        <ThemedText fontSize={16} color="white" opacity={0.8}>
          Waiting for user to pick
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={styles.buttons}>
        {/* Reject */}
        <TouchableOpacity
          style={[styles.button, styles.reject]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>

        {/* Accept */}
        <TouchableOpacity
          style={[styles.button, styles.accept]}
          onPress={() =>
            router.push(
              `/outgoing-call?id=${id}&recipientId=${recipientId}&mode=join`
            )
          }
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Ringing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Dark call screen
    justifyContent: "space-between",
    paddingVertical: 80,
  },
  center: {
    alignItems: "center",
    gap: 10,
  },
  avatarPulse: {
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 90,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
  },
  button: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  reject: {
    backgroundColor: "#ff3b30",
  },
  accept: {
    backgroundColor: "#34c759",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
