import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useGetSingleFriend } from "@/hooks/friend-hooks.hooks";
import { UserProfileR } from "@/types/auth.types";
import { generateURL } from "@/utils/image-utils.utils";
import { Call, VideoCircle, CallSlash } from "iconsax-react-native";
import { BlurView } from "expo-blur";

const Ringing = () => {
  const { id, recipientId, mode } = useLocalSearchParams<{
    id: string;
    recipientId: string;
    mode: "join" | "create";
  }>();

  console.log(recipientId,"SHSHSH")
  console.log(id,"IDDDDDDDDDDDDD")

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
        id: recipientId as string,
      });
      setUser(response?.data);
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Background with app primary color */}
      <View style={styles.backgroundGradient}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <ThemedText
              fontSize={16}
              color="white"
              marginTop={20}
              opacity={0.9}
            >
              Loading...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Top Section - Call Type */}
            <View style={styles.topSection}>
              <View style={styles.callTypeBadge}>
                <VideoCircle size={20} color="#fff" variant="Bold" />
                <ThemedText fontSize={14} color="white" weight="semibold" marginLeft={6}>
                  Video Call
                </ThemedText>
              </View>
            </View>

            {/* Middle Section - Caller Info */}
            <View style={styles.center}>
              {/* Animated Rings */}
              <Animated.View
                style={[
                  styles.ringOuter,
                  { transform: [{ scale: pulse }] },
                ]}
              />
              
              <Animated.View
                style={[
                  styles.ringMiddle,
                  { 
                    transform: [{ rotate: rotateInterpolate }],
                    opacity: pulse.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [0.3, 0.6],
                    }),
                  },
                ]}
              />

              {/* Avatar */}
              <View style={styles.avatarWrapper}>
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

              {/* User Info */}
              <View style={styles.userInfo}>
                <ThemedText
                  fontSize={28}
                  weight="bold"
                  color="white"
                  marginTop={24}
                  textAlign="center"
                >
                  {user?.first_name} {user?.last_name}
                </ThemedText>

                {user?.username && (
                  <ThemedText
                    fontSize={15}
                    color="white"
                    opacity={0.8}
                    marginTop={4}
                    textAlign="center"
                  >
                    @{user.username}
                  </ThemedText>
                )}

                <View style={styles.statusContainer}>
                  <Animated.View 
                    style={[
                      styles.pulsingDot,
                      {
                        transform: [{ scale: pulse }],
                      }
                    ]} 
                  />
                  <ThemedText fontSize={16} color="white" opacity={0.95}>
                    Incoming call...
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Bottom Section - Actions */}
            <View style={styles.bottomSection}>
              <View style={styles.buttons}>
                {/* Decline Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleDeclinePress}
                  style={styles.actionButton}
                >
                  <Animated.View
                    style={[
                      styles.declineButton,
                      { transform: [{ scale: declineScale }] },
                    ]}
                  >
                    <CallSlash size={28} color="#fff" variant="Bold" />
                  </Animated.View>
                  <ThemedText fontSize={14} color="white" marginTop={8} opacity={0.9}>
                    Decline
                  </ThemedText>
                </TouchableOpacity>

                {/* Accept Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleAcceptPress}
                  style={styles.actionButton}
                >
                  <Animated.View
                    style={[
                      styles.acceptButton,
                      { transform: [{ scale: acceptScale }] },
                    ]}
                  >
                    <Call size={28} color="#fff" variant="Bold" />
                  </Animated.View>
                  <ThemedText fontSize={14} color="white" marginTop={8} opacity={0.9}>
                    Accept
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
};

export default Ringing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
  },
  bgCircle: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  bgCircle1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
  },
  bgCircle2: {
    width: 300,
    height: 300,
    bottom: -50,
    left: -50,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
  },
  topSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  callTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backdropFilter: "blur(10px)",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  ringOuter: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  ringMiddle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  avatarWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 80,
  },
  actionButton: {
    alignItems: "center",
  },
  declineButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff3b30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  acceptButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#34c759",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#34c759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
