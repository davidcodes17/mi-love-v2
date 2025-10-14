import ChatCompo from "@/components/common/chat-compo";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { useGetAllChats } from "@/hooks/chats.hooks";
import { useUserStore } from "@/store/store";
import { Chat, ChatResponse } from "@/types/chat.types";
import { Message } from "iconsax-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router"; // ✅ Expo Router version

export default function Page() {
  const [data, setData] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useUserStore();

  const fetchChats = async (showMainLoader = true) => {
    try {
      if (showMainLoader) setLoading(true);
      const response = await useGetAllChats();
      setData(response);
    } catch (error) {
      console.error("❌ Failed to fetch chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Fetch once on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // ✅ Re-fetch every time the page regains focus
  useFocusEffect(
    useCallback(() => {
      fetchChats(false); // no main loader, just refresh silently
    }, [])
  );

  // ✅ Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats(false);
  }, []);

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView padding={20}>
        <FlatList
          data={data?.data || []}
          keyExtractor={(item: Chat) => item.id}
          renderItem={({ item }) => (
            <ChatCompo chat={item} currentUserId={user?.id ?? ""} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]} // Android
              tintColor={COLORS.primary} // iOS
            />
          }
          ListHeaderComponent={() => (
            <ThemedView
              alignItems="center"
              flexDirection="row"
              marginBottom={20}
              gap={10}
              justifyContent="center"
            >
              <Message variant="Bold" size={20} color={COLORS.primary} />
              <ThemedText textAlign="center" fontSize={20}>
                Inbox
              </ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={() =>
            !loading && (
              <ThemedText textAlign="center" marginTop={40}>
                No chats yet
              </ThemedText>
            )
          }
          ListFooterComponent={() =>
            loading && !refreshing ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginTop: 20 }}
              />
            ) : null
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}
