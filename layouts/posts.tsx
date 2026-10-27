import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ThemedText } from "@/components/ui/themed-view";
import { PostsResponse, Post as PostType } from "@/types/post.types";
import Post from "@/components/common/post";
import { useGetAllPosts } from "@/hooks/post-hooks.hooks";
import TextPost from "@/components/common/text-post";
import StoriesTray from "@/components/common/stories-tray";
import { TYPOGRAPHY } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "@/hooks/use-theme";

const Posts = forwardRef((props, ref) => {
  const theme = useTheme();
  const [data, setData] = useState<PostsResponse>(null!);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storiesKey, setStoriesKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = async (nextPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    const response = await useGetAllPosts({
      data: {
        filterBy: "all",
        filterValue: "",
        limit: "20",
        page: String(nextPage),
      },
    });
    if (response?.error) {
      setError(response.message || response.error);
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    const posts = response?.posts || response?.data || [];
    setData((prev) => ({
      posts:
        append && prev
          ? [...prev.posts, ...(Array.isArray(posts) ? posts : [])]
          : Array.isArray(posts)
            ? posts
            : [],
      meta: response?.meta,
    }));
    setPage(nextPage);
    setLoading(false);
    setLoadingMore(false);
  };

  useImperativeHandle(ref, () => ({
    refresh: async () => {
      setRefreshing(true);
      await Promise.all([fetchPosts(), Promise.resolve(setStoriesKey((k) => k + 1))]);
      setRefreshing(false);
    },
  }));

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setStoriesKey((k) => k + 1);
    await fetchPosts();
    setRefreshing(false);
  }, []);

  const handleDeleted = (postId: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            posts: (prev.posts || []).filter((p) => p.id !== postId),
          }
        : prev
    );
  };

  const handleUpdated = (updated: PostType) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            posts: prev.posts.map((post) =>
              post.id === updated.id ? { ...post, ...updated } : post
            ),
          }
        : prev
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={[styles.emptyStateIconContainer, { borderColor: theme.colors.primary, backgroundColor: theme.colors.soft }]}>
        <Ionicons name="camera-outline" size={52} color={theme.colors.primary} />
      </View>
      <ThemedText style={[styles.emptyTitle, { color: theme.colors.text }]}>Your feed is waiting</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: theme.colors.muted }]}>
        When people you follow share photos, you'll see them here.
      </ThemedText>
    </View>
  );

  const loadMore = () => {
    if (
      loadingMore ||
      !data?.meta ||
      page >= (data.meta.totalPages || 1)
    )
      return;
    fetchPosts(page + 1, true);
  };

  const ListHeader = (
    <StoriesTray refreshKey={storiesKey} />
  );

  if (loading && !data) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={data?.posts || []}
      keyExtractor={(item: PostType) => item.id}
      ListHeaderComponent={ListHeader}
      renderItem={({ item }) =>
        item?.files?.length > 0 ? (
          <Post
            post={item}
            onDeleted={handleDeleted}
            onUpdated={handleUpdated}
          />
        ) : (
          <TextPost
            post={item}
            onDeleted={handleDeleted}
            onUpdated={handleUpdated}
          />
        )
      }
      ListEmptyComponent={
        !loading && error ? (
          <View style={styles.emptyStateContainer}>
            <ThemedText style={styles.emptySubtitle}>{error}</ThemedText>
            <TouchableOpacity style={[styles.retry, { backgroundColor: theme.colors.primary }]} onPress={() => fetchPosts()}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : !loading ? (
          renderEmptyState()
        ) : null
      }
      ListFooterComponent={
        loadingMore ? <ActivityIndicator style={{ padding: 18 }} /> : null
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        !(data?.posts?.length) ? styles.emptyListContent : styles.listContent,
        { backgroundColor: theme.colors.background },
      ]}
    />
  );
});

export default Posts;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    backgroundColor: "#fff",
  },
  listContent: {
    paddingBottom: 24,
    backgroundColor: "#fff",
  },
  emptyListContent: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyStateIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#262626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: "700",
    color: "#262626",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: "#8e8e8e",
    textAlign: "center",
    lineHeight: 20,
  },
  retry: {
    marginTop: 16,
    backgroundColor: "#262626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: "#fff", fontWeight: "700" },
});
