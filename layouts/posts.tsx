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
import ThemedView from "@/components/ui/themed-view";
import { PostsResponse, Post as PostType } from "@/types/post.types";
import Post from "@/components/common/post";
import { useGetAllPosts } from "@/hooks/post-hooks.hooks";
import TextPost from "@/components/common/text-post";
import { COLORS } from "@/config/theme";

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
});
