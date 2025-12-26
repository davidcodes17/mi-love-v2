import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { PostsResponse, Post as PostType } from "@/types/post.types";
import Post from "@/components/common/post";
import { useGetAllPosts } from "@/hooks/post-hooks.hooks";
import TextPost from "@/components/common/text-post";
import { COLORS, TYPOGRAPHY } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";

const Posts = forwardRef((props, ref) => {
  const [data, setData] = useState<PostsResponse>(null!);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPosts = async () => {
    setLoading(true);
    const response = await useGetAllPosts({
      data: {
        filterBy: "",
        filterValue: "",
        limit: "100",
        page: "1",
      },
    });
    setData(response);
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      setRefreshing(true);
      await fetchPosts();
      setRefreshing(false);
    },
  }));

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="heart-outline" size={64} color={COLORS.primary} />
        </View>
      </View>
      <ThemedText weight="bold" fontSize={TYPOGRAPHY.title} color="#333" marginBottom={8} textAlign="center">
        No Posts Yet
      </ThemedText>
      <ThemedText weight="semibold" fontSize={TYPOGRAPHY.md} color={COLORS.primary} marginBottom={12} textAlign="center">
        Be the first to share something special!
      </ThemedText>
      <ThemedText fontSize={TYPOGRAPHY.sm} color="#666" textAlign="center" lineHeight={20}>
        Posts from people you follow will appear here.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView marginTop={20} gap={20} flex={1}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={data?.posts || []}
          keyExtractor={(item: PostType) => item.id}
          renderItem={({ item }) =>
            item?.files?.length > 0 ? (
              <Post post={item} />
            ) : (
              <TextPost post={item} />
            )
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ gap: 20, paddingBottom: 40 }}
        />
      )}
    </ThemedView>
  );
});

export default Posts;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(93, 2, 1, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 64,
    height: 64,
  },
});
