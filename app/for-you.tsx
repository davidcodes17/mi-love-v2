import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import {
  useGetVideoPosts,
  useLikePost,
  useUnlikePost,
} from "@/hooks/post-hooks.hooks";
import { generateURL } from "@/utils/image-utils.utils";
import { Post } from "@/types/post.types";

type ForYouScreenProps = {
  isTabRoot?: boolean;
};

export default function ForYouScreen({ isTabRoot = false }: ForYouScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedHeight, setFeedHeight] = useState(0);
  const [retryKey, setRetryKey] = useState<Record<string, number>>({});
  const [liking, setLiking] = useState<Record<string, boolean>>({});
  const loadingMore = useRef(false);
  const { width } = useWindowDimensions();

  const load = useCallback(async (nextCursor?: string | null, append = false) => {
    if (loadingMore.current) return;
    loadingMore.current = true;
    if (!append) setLoading(true);
    setError(null);
    try {
      const res = await useGetVideoPosts({
        data: {
          limit: "10",
          page: nextCursor ? undefined : "1",
          cursor: nextCursor || undefined,
        },
      });
      if (res?.error) {
        setError(res.message || res.error);
        return;
      }
      const list = res?.posts || res?.data || [];
      setPosts((prev) =>
        append
          ? [
              ...prev,
              ...list.filter(
                (item: Post) => !prev.some((old) => old.id === item.id)
              ),
            ]
          : list
      );
      setCursor(res?.meta?.nextCursor || null);
      if (!append && list[0]?.id) setActiveId(list[0].id);
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingMore.current = false;
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0]?.item as Post | undefined;
      if (first?.id) setActiveId(first.id);
    }
  ).current;

  const toggleLike = async (item: Post) => {
    if (liking[item.id]) return;
    const wasLiked = !!item.likedByMe;
    setLiking((old) => ({ ...old, [item.id]: true }));
    setPosts((old) =>
      old.map((post) =>
        post.id === item.id
          ? {
              ...post,
              likedByMe: !wasLiked,
              _count: {
                ...post._count,
                likes: Math.max(0, post._count.likes + (wasLiked ? -1 : 1)),
              },
            }
          : post
      )
    );
    const res = wasLiked
      ? await useUnlikePost({ id: item.id })
      : await useLikePost({ id: item.id });
    if (res?.error) {
      setPosts((old) =>
        old.map((post) => (post.id === item.id ? item : post))
      );
      setError(res.message || "Could not update like");
    }
    setLiking((old) => ({ ...old, [item.id]: false }));
  };

  const sharePost = async (item: Post) => {
    await Share.share({
      message: `Check out this reel on Mi Love: milove://post/${item.id}`,
    });
  };

  const renderItem = ({ item }: { item: Post }) => {
    const file = item.files?.[0];
    const uri = file?.url ? generateURL({ url: file.url }) : null;
    const poster = file?.thumbnailUrl
      ? generateURL({ url: file.thumbnailUrl })
      : undefined;
    const isActive = activeId === item.id;

    return (
      <View style={[styles.slide, { width, height: feedHeight }]}>
        {uri ? (
          <Video
            key={`${item.id}-${retryKey[item.id] || 0}`}
            source={{ uri }}
            style={{ width, height: feedHeight }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive}
            isLooping
            isMuted={false}
            posterSource={poster ? { uri: poster } : undefined}
            usePoster={!!poster}
            onError={() => setError("This video could not be played.")}
          />
        ) : (
          <Image
            source={require("@/assets/post.jpg")}
            style={{ width, height: feedHeight }}
            resizeMode="cover"
          />
        )}

        <View style={styles.overlay}>
          {isTabRoot ? (
            <Text style={styles.reelsTitle}>Reels</Text>
          ) : (
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          )}

          <View style={styles.meta}>
            <Text style={styles.username}>@{item.user?.username}</Text>
            {!!item.content && (
              <Text style={styles.caption} numberOfLines={3}>
                {item.content}
              </Text>
            )}
          </View>

          <View style={styles.sideActions}>
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => router.push(`/post/${item.id}` as any)}
            >
              <Ionicons name="chatbubble-outline" size={28} color="#fff" />
              <Text style={styles.sideCount}>
                {item._count?.comments || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => toggleLike(item)}
              disabled={liking[item.id]}
            >
              <Ionicons
                name={item.likedByMe ? "heart" : "heart-outline"}
                size={28}
                color={item.likedByMe ? "#ed4956" : "#fff"}
              />
              <Text style={styles.sideCount}>{item._count?.likes || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => sharePost(item)}
            >
              <Ionicons name="paper-plane-outline" size={27} color="#fff" />
              <Text style={styles.sideCount}>Share</Text>
            </TouchableOpacity>
            {!!error && activeId === item.id && (
              <TouchableOpacity
                style={styles.sideBtn}
                onPress={() => {
                  setError(null);
                  setRetryKey((old) => ({
                    ...old,
                    [item.id]: (old[item.id] || 0) + 1,
                  }));
                }}
              >
                <Ionicons name="refresh" size={27} color="#fff" />
                <Text style={styles.sideCount}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        onLayout={(event) => setFeedHeight(event.nativeEvent.layout.height)}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        onEndReached={() => {
          if (cursor) load(cursor, true);
        }}
        onEndReachedThreshold={0.6}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.empty}>{error || "No videos yet"}</Text>
            {!!error && (
              <TouchableOpacity onPress={() => load()} style={styles.retry}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#fff"
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        getItemLayout={(_, index) => ({
          length: feedHeight,
          offset: feedHeight * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { color: "#fff" },
  slide: { backgroundColor: "#000" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 16,
  },
  back: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  reelsTitle: {
    marginTop: 8,
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  meta: {
    marginBottom: 48,
    paddingRight: 72,
  },
  username: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 8,
  },
  caption: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  sideActions: {
    position: "absolute",
    right: 12,
    bottom: 120,
    gap: 18,
    alignItems: "center",
  },
  sideBtn: {
    alignItems: "center",
    gap: 4,
  },
  sideCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  retry: { padding: 14 },
  retryText: { color: "#fff", fontWeight: "700" },
});
