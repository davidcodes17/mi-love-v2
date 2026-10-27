import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ui/themed-view";
import { generateURL } from "@/utils/image-utils.utils";
import { useGetAllLikes } from "@/hooks/post-hooks.hooks";
import { PostUser } from "@/types/post.types";

export default function PostLikesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [likers, setLikers] = useState<PostUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextPage = 1, append = false) => {
    if (!id) return;
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const res = await useGetAllLikes({
        id,
        page: String(nextPage),
        limit: "30",
      });
      if (res?.error) {
        setError(res.message || res.error);
        return;
      }
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setLikers((prev) =>
        append && Array.isArray(raw) ? [...prev, ...raw] : Array.isArray(raw) ? raw : []
      );
      setPage(nextPage);
      setTotalPages(res?.meta?.totalPages || 1);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color="#262626" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Likes</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#262626" />
        </View>
      ) : (
        <FlatList
          data={likers}
          keyExtractor={(item, index) => item.id || String(index)}
          ListEmptyComponent={
            <View style={styles.center}>
              <ThemedText style={styles.empty}>
                {error || "No likes yet"}
              </ThemedText>
              {!!error && (
                <TouchableOpacity onPress={() => load()} style={styles.retry}>
                  <ThemedText style={styles.retryText}>Retry</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ padding: 14 }} /> : null
          }
          onEndReached={() => {
            if (!loadingMore && page < totalPages) load(page + 1, true);
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                router.push(`/(friends)/view-friends?id=${item.id}`)
              }
            >
              <Image
                source={
                  item.profile_picture?.url
                    ? {
                        uri: generateURL({ url: item.profile_picture.url }),
                      }
                    : require("@/assets/user.png")
                }
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.username}>
                  {item.username}
                </ThemedText>
                <ThemedText style={styles.name}>
                  {`${item.first_name || ""} ${item.last_name || ""}`.trim()}
                </ThemedText>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#262626" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  empty: { color: "#8e8e8e" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#efefef",
  },
  username: {
    fontSize: 14,
    fontWeight: "700",
    color: "#262626",
  },
  name: {
    fontSize: 13,
    color: "#8e8e8e",
    marginTop: 2,
  },
  retry: { marginTop: 14, padding: 10 },
  retryText: { color: "#0095f6", fontWeight: "700" },
});
