import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Gift, SendGiftPayload } from "@/types/wallet.types";
import { useSendGift } from "@/hooks/wallet-hooks.hooks";
import { ThemedText } from "@/components/ui/themed-view";

const GiftCompo = ({
  gift,
  receiverId,
}: {
  gift: Gift;
  receiverId: string;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSendGift = async () => {
    if (loading) return; // avoid double-taps
    setLoading(true);

    try {
      const data: SendGiftPayload = {
        giftId: gift.id,
        receiverId,
      };

      const response = await useSendGift({ data });
      console.log("🎁 Gift API response:", response);

      if (!response?.message) {
        Alert.alert("Error", "Something went wrong. Please try again.");
        return;
      }

      if (
        response.message.toLowerCase().includes("insufficient balance") ||
        response.message.toLowerCase().includes("error")
      ) {
        // 🔴 error case
        Alert.alert("❌ Failed", response.message);
      } else {
        // ✅ success case
        Alert.alert("🎉 Success", response.message);
        console.log("✅ Gift sent successfully:", response.message);
      }
    } catch (err: any) {
      console.error("❌ Failed to send gift:", err);
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
    </TouchableOpacity>
  );
};

export default GiftCompo;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    width: 70,
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
});
