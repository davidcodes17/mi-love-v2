import BackButton from "@/components/common/back-button";
import SearchInput from "@/components/common/search-input";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import { useGetAllFriends, useUnblockFriend } from "@/hooks/friend-hooks.hooks";
import { UserProfileR } from "@/types/auth.types";
import { generateURL } from "@/utils/image-utils.utils";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
} from "react-native";

export default function BlockedUsers() {
  const [users, setUsers] = useState<UserProfileR[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const response = await useGetAllFriends({
        filterBy: { filterBy: "blocked" },
        filterValue: query,
      });
      setUsers(Array.isArray(response?.data) ? response.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const unblock = async (id: string) => {
    setBusyId(id);
    try {
      const response = await useUnblockFriend({ id });
      if (!response?.error) {
        setUsers((current) => current.filter((user) => user.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ThemedView flex={1} padding={20}>
        <ThemedView flexDirection="row" alignItems="center" gap={14}>
          <BackButton />
          <ThemedText weight="bold" fontSize={22}>
            Blocked users
          </ThemedText>
        </ThemedView>
        <SearchInput
          placeholder="Search blocked users"
          onChangeText={(value) => loadUsers(value.trim())}
        />
        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 20, flexGrow: 1 }}
            ListEmptyComponent={
              <ThemedText textAlign="center" color="#666" marginTop={40}>
                No blocked users found.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <ThemedView style={styles.row}>
                <Image
                  source={
                    item.profile_picture?.url
                      ? { uri: generateURL({ url: item.profile_picture.url }) }
                      : require("@/assets/user.png")
                  }
                  style={styles.avatar}
                />
                <ThemedView flex={1}>
                  <ThemedText weight="bold">@{item.username}</ThemedText>
                  <ThemedText color="#666">
                    {item.first_name} {item.last_name}
                  </ThemedText>
                </ThemedView>
                <NativeButton
                  mode="outline"
                  text="Unblock"
                  onPress={() => unblock(item.id)}
                  isLoading={busyId === item.id}
                  disabled={busyId !== null}
                  style={{ paddingVertical: 9 }}
                />
              </ThemedView>
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
});
