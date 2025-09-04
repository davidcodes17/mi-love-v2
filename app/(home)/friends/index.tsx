import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import FriendCompo from "@/components/common/friend-compo";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/config/theme";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import globalStyles from "@/components/styles/global-styles";
import { Profile2User } from "iconsax-react-native";
import { FriendsListResponse, FilterBy } from "@/types/friend.types";
import { useGetAllFriends } from "@/hooks/friend-hooks.hooks";

export default function Page() {
  const [friends, setFriends] = useState<FriendsListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // start with loading true
  const [filterBy] = useState<FilterBy>({ filterBy: "friends" });
  const [refreshing, setRefreshing] = useState(false);

  const fetchFriends = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await useGetAllFriends({ filterBy });
      setFriends(response || null);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [filterBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFriends(true);
  }, [fetchFriends]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={friends?.data || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FriendCompo user={item} isFriend={true} />}
          contentContainerStyle={{ padding: 20, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={() => (
            <ThemedView
              alignItems="center"
              flexDirection="row"
              marginBottom={20}
              gap={10}
              justifyContent="center"
            >
              <Profile2User variant="Bold" size={20} color={COLORS.primary} />
              <ThemedText textAlign="center" fontSize={20}>
                Friends
              </ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <ThemedText fontSize={16} textAlign="center">
                No friends found.
              </ThemedText>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
