import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/common/back-button";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { toast } from "@/components/lib/toast-manager";
import { COLORS } from "@/config/theme";
import { useGetAllGifts, useSendGift } from "@/hooks/wallet-hooks.hooks";
import { Gift } from "@/types/wallet.types";
import { generateURL } from "@/utils/image-utils.utils";

export default function GiftShop() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [receiverId, setReceiverId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    useGetAllGifts()
      .then((response) => {
        const payload = response?.data ?? response;
        setGifts(Array.isArray(payload) ? payload : payload?.gifts ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const send = async (gift: Gift) => {
    const receiver = receiverId.trim();
    if (!receiver) {
      toast.error("Enter the receiver's user ID");
      return;
    }
    setSendingId(gift.id);
    try {
      const response = await useSendGift({
        data: { giftId: gift.id, receiverId: receiver },
      });
      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success(response?.message ?? "Gift sent");
      }
    } finally {
      setSendingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton />
        <ThemedText fontSize={20} fontWeight="700" marginLeft={14}>
          Gift Shop
        </ThemedText>
      </View>
      <View style={styles.receiverCard}>
        <ThemedText fontSize={13} fontWeight="600" marginBottom={8}>
          Receiver user ID
        </ThemedText>
        <TextInput
          value={receiverId}
          onChangeText={setReceiverId}
          autoCapitalize="none"
          placeholder="Enter receiver ID"
          style={styles.input}
        />
      </View>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={gifts}
          numColumns={2}
          keyExtractor={(gift) => gift.id}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columns}
          ListEmptyComponent={
            <ThemedView alignItems="center" paddingTop={60}>
              <ThemedText color="#6B7280">No gifts are available.</ThemedText>
            </ThemedView>
          }
          renderItem={({ item }) => (
            <View style={styles.gift}>
              {item.image?.url ? (
                <Image
                  source={{ uri: generateURL({ url: item.image.url }) }}
                  style={styles.image}
                />
              ) : (
                <View style={[styles.image, styles.placeholder]} />
              )}
              <ThemedText fontSize={14} fontWeight="700" numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText fontSize={12} color="#6B7280" marginVertical={5}>
                {Number(item.points).toLocaleString()} coins
              </ThemedText>
              <TouchableOpacity
                disabled={sendingId === item.id}
                onPress={() => send(item)}
                style={styles.button}
              >
                {sendingId === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText color="#fff" fontWeight="600">Send</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FA" },
  header: { flexDirection: "row", alignItems: "center", padding: 20 },
  receiverCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  columns: { gap: 12 },
  gift: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  image: { width: "100%", height: 120, borderRadius: 12, marginBottom: 10 },
  placeholder: { backgroundColor: "#F3F4F6" },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  loader: { marginTop: 60 },
});
