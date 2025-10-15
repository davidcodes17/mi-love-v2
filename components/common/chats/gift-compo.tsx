import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
  Dimensions,
} from "react-native";
import React, { useRef, useState } from "react";
import { Gift, SendGiftPayload } from "@/types/wallet.types";
import { useSendGift } from "@/hooks/wallet-hooks.hooks";
import { ThemedText } from "@/components/ui/themed-view";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const GiftCompo = ({
  gift,
  receiverId,
  onSuccess, // callback when gift sent
}: {
  gift: Gift;
  receiverId: string;
  onSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const animationRef = useRef<LottieView>(null);

  const handleSendGift = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const data: SendGiftPayload = { giftId: gift.id, receiverId };
      const response = await useSendGift({ data });

      if (!response?.message) {
        Alert.alert("Error", "Something went wrong. Please try again.");
        return;
      }

      if (
        response.message.toLowerCase().includes("insufficient balance") ||
        response.message.toLowerCase().includes("error")
      ) {
        Alert.alert("❌ Failed", response.message);
      } else {
        setShowAnimation(true);
        onSuccess();
        Alert.alert("🎉 Success", response.message);
        console.log("✅ Gift sent successfully:", response.message);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to send gift. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSendGift}
      style={styles.wrapper}
      activeOpacity={0.8}
      disabled={loading}
    >
      <View style={{ alignItems: "center" }}>
        {loading ? (
          <ActivityIndicator size="small" color="#FF4081" style={styles.image} />
        ) : (
          <Image
            source={{ uri: gift?.image?.url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <ThemedText fontSize={12} textAlign="center" numberOfLines={1}>
          {gift.name}
        </ThemedText>
        <ThemedText fontSize={10} textAlign="center" color="#888">
          {gift.points} pts
        </ThemedText>
      </View>

      {showAnimation && (
        <LottieView
          ref={animationRef}
          source={require("@/assets/jsons/splash.json")}
          style={StyleSheet.absoluteFill}
          loop={false}
          onAnimationFinish={() => setShowAnimation(false)}
        />
      )}
    </TouchableOpacity>
  );
};

export default GiftCompo;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    width: 70,
    position: "relative",
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
});
