import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useGetSingleFriend } from "@/hooks/friend-hooks.hooks";
import { UserProfileR } from "@/types/auth.types";
import { generateURL } from "@/utils/image-utils.utils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const Ringing = () => {
  const { id, recipientId, mode } = useLocalSearchParams<{
    id: string;
    recipientId: string;
    mode: "join" | "create";
  }>();

  const [user, setUser] = useState<UserProfileR | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation refs
  const pulse = useRef(new Animated.Value(1)).current;
  const ringRotation = useRef(new Animated.Value(0)).current;
  const declineScale = useRef(new Animated.Value(1)).current;
  const acceptScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const fecthProfile = async () => {
    try {
      setLoading(true);
      const response = await useGetSingleFriend({
        id: recipientId!,
      });
      setUser(response);
      console.log(response, "Recipient Data");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fecthProfile();
  }, []);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulsing avatar animation
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

  // Rotating ring animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateInterpolate = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Button press animations
  const handleDeclinePress = () => {
    Animated.sequence([
      Animated.timing(declineScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(declineScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const handleAcceptPress = () => {
    Animated.sequence([
      Animated.timing(acceptScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(acceptScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push(
        `/outgoing-call?id=${id}&recipientId=${recipientId}&mode=join`
      );
    });
  };

  return (
    <LinearGradient
      colors={["#0f0c29", "#302b63", "#24243e"]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <ThemedText
              fontSize={16}
              color="white"
              marginTop={20}
              opacity={0.8}
            >
              Connecting...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Caller Info */}
            <View style={styles.center}>
              {/* Rotating Ring */}
              <Animated.View
                style={[
                  styles.rotatingRing,
                  { transform: [{ rotate: rotateInterpolate }] },
                ]}
              >
                <View style={styles.ringSegment} />
              </Animated.View>

              {/* Pulsing Background */}
              <Animated.View
                style={[styles.avatarPulse, { transform: [{ scale: pulse }] }]}
              >
                {/* Avatar Image */}
                <View style={styles.avatarContainer}>
                  <Image
                    source={
                      imageError || !user?.profile_picture?.url
                        ? require("@/assets/user.png")
                        : {
                            uri: generateURL({
                              url: user.profile_picture.url,
                            }),
                          }
                    }
                    onError={() => setImageError(true)}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>

              {/* User Info */}
              <View style={styles.userInfo}>
                <ThemedText
                  fontSize={32}
                  weight="bold"
                  color="white"
                  marginTop={30}
                  textAlign="center"
                >
                  {user?.first_name} {user?.last_name}
                </ThemedText>

                {user?.username && (
                  <ThemedText
                    fontSize={16}
                    color="white"
                    opacity={0.7}
                    marginTop={5}
                    textAlign="center"
                  >
                    @{user.username}
                  </ThemedText>
                )}

                <View style={styles.statusContainer}>
                  <View style={styles.pulsingDot} />
                  <ThemedText fontSize={18} color="white" opacity={0.9}>
                    Calling...
                  </ThemedText>
                </View>

                <ThemedText
                  fontSize={14}
                  color="white"
                  opacity={0.6}
                  marginTop={5}
                  textAlign="center"
                >
                  Waiting for response
                </ThemedText>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.buttons}>
              {/* Decline Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDeclinePress}
              >
                <Animated.View
                  style={[
                    styles.buttonWrapper,
                    { transform: [{ scale: declineScale }] },
                  ]}
                >
                  <LinearGradient
                    colors={["#ff3b30", "#d32f2f"]}
                    style={styles.button}
                  >
                    <Ionicons name="call" size={32} color="white" />
                    <Text style={styles.buttonText}>Decline</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>

              {/* Accept Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAcceptPress}
              >
                <Animated.View
                  style={[
                    styles.buttonWrapper,
                    { transform: [{ scale: acceptScale }] },
                  ]}
                >
                  <LinearGradient
                    colors={["#34c759", "#2db84e"]}
                    style={styles.button}
                  >
                    <Ionicons name="call" size={32} color="white" />
                    <Text style={styles.buttonText}>Accept</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </LinearGradient>
  );
};

export default Ringing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    position: "relative",
  },
  rotatingRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  ringSegment: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: "rgba(52, 199, 89, 0.5)",
    borderRightColor: "rgba(52, 199, 89, 0.3)",
  },
  avatarPulse: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#34c759",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34c759",
    shadowColor: "#34c759",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 40,
  },
  buttonWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
});
