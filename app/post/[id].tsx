import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Post from "@/components/common/post";
import TextPost from "@/components/common/text-post";
import { ThemedText } from "@/components/ui/themed-view";
import { generateURL } from "@/utils/image-utils.utils";
import { useUserStore } from "@/store/store";
import {
  useCreatePostComment,
  useDeletePostComment,
  useGetPostComments,
  useGetSinglePost,
} from "@/hooks/post-hooks.hooks";
import { Post as PostType, PostComment } from "@/types/post.types";
import { toast } from "@/components/lib/toast-manager";

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

const nestComments = (list: PostComment[]): PostComment[] => {
  const roots: PostComment[] = [];
  const byId: Record<string, PostComment> = {};

  list.forEach((c) => {
    byId[c.id] = { ...c, replies: [] };
  });

  list.forEach((c) => {
    const node = byId[c.id];
    if (c.parentId && byId[c.parentId]) {
      byId[c.parentId].replies = byId[c.parentId].replies || [];
      byId[c.parentId].replies!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export default function PostDetailScreen() {
  const { id, commentId } = useLocalSearchParams<{
    id: string;
    commentId?: string;
  }>();
  const { user } = useUserStore();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<PostComment | null>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<PostComment>>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [postRes, commentsRes] = await Promise.all([
        useGetSinglePost({ id }),
        useGetPostComments({ id, page: "1", limit: "30", order: "asc" }),
      ]);

      if (postRes?.error) throw new Error(postRes.message || postRes.error);
      const postData = postRes?.data || postRes?.post || postRes;
      setPost(postData && postData.id ? postData : null);

      const raw =
        commentsRes?.data ||
        commentsRes?.comments ||
        (Array.isArray(commentsRes) ? commentsRes : []);
      setComments(Array.isArray(raw) ? raw : []);
      setCommentsPage(1);
      setCommentsTotalPages(commentsRes?.meta?.totalPages || 1);
      if (commentsRes?.error) {
        setError(commentsRes.message || commentsRes.error);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load post";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const nested = useMemo(() => nestComments(comments), [comments]);

  useEffect(() => {
    if (!commentId || !nested.length) return;
    const index = nested.findIndex(
      (comment) =>
        comment.id === commentId ||
        comment.replies?.some((reply) => reply.id === commentId)
    );
    if (index >= 0) {
      setTimeout(
        () =>
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.4,
          }),
        250
      );
    }
  }, [commentId, nested]);

  const loadMoreComments = async () => {
    if (!id || loadingMore || commentsPage >= commentsTotalPages) return;
    setLoadingMore(true);
    const nextPage = commentsPage + 1;
    const res = await useGetPostComments({
      id,
      page: String(nextPage),
      limit: "30",
      order: "asc",
    });
    if (!res?.error) {
      const raw = res?.data || res?.comments || [];
      setComments((prev) => [
        ...prev,
        ...(Array.isArray(raw)
          ? raw.filter((item) => !prev.some((old) => old.id === item.id))
          : []),
      ]);
      setCommentsPage(nextPage);
      setCommentsTotalPages(res?.meta?.totalPages || nextPage);
    } else {
      toast.error(res.message || "Could not load more comments");
    }
    setLoadingMore(false);
  };

  const submitComment = async () => {
    if (!id || !text.trim() || sending) return;
    setSending(true);
    try {
      const res = await useCreatePostComment({
        id,
        data: {
          content: text.trim(),
          parentId: replyTo?.id,
        },
      });

      if (res?.error || (typeof res === "string" && res.toLowerCase?.().includes("error"))) {
        toast.error("Could not post comment");
        return;
      }

      setText("");
      setReplyTo(null);
      await load();
    } catch (e) {
      toast.error("Could not post comment");
    } finally {
      setSending(false);
    }
  };

  const removeComment = (comment: PostComment) => {
    Alert.alert("Delete comment?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const res = await useDeletePostComment({
            id: id!,
            commentId: comment.id,
          });
          if (res?.error) {
            toast.error("Could not delete comment");
            return;
          }
          await load();
        },
      },
    ]);
  };

  const renderComment = (comment: PostComment, isReply = false) => {
    const canDelete =
      comment.user?.id === user?.id || post?.userId === user?.id;
    const highlight = commentId === comment.id;

    return (
      <View key={comment.id}>
        <View
          style={[
            styles.commentRow,
            isReply && styles.replyRow,
            highlight && styles.highlight,
          ]}
        >
          <Image
            source={
              comment.user?.profile_picture?.url
                ? {
                    uri: generateURL({
                      url: comment.user.profile_picture.url,
                    }),
                  }
                : require("@/assets/user.png")
            }
            style={styles.commentAvatar}
          />
          <View style={styles.commentBody}>
            <Text style={styles.commentText}>
              <Text style={styles.commentUser}>{comment.user?.username} </Text>
              {comment.content}
            </Text>
            <View style={styles.commentMeta}>
              <Text style={styles.metaText}>
                {formatTime(comment.created_at)}
              </Text>
              {!isReply && (
                <TouchableOpacity onPress={() => setReplyTo(comment)}>
                  <Text style={styles.metaAction}>Reply</Text>
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity onPress={() => removeComment(comment)}>
                  <Text style={styles.metaAction}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {(comment.replies || []).map((r) => renderComment(r, true))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#262626" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.center}>
        <ThemedText>Post not found</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={{ color: "#0095f6", marginTop: 12 }}>
            Go back
          </ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color="#262626" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Comments</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <FlatList
          ref={listRef}
          data={nested}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              {post.files?.length > 0 ? (
                <Post
                  post={post}
                  onDeleted={() => router.back()}
                  onUpdated={(updated) => setPost((old) => ({ ...old!, ...updated }))}
                />
              ) : (
                <TextPost
                  post={post}
                  onDeleted={() => router.back()}
                  onUpdated={(updated) => setPost((old) => ({ ...old!, ...updated }))}
                />
              )}
              <View style={styles.divider} />
            </View>
          }
          renderItem={({ item }) => renderComment(item)}
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <ThemedText style={styles.emptyTitle}>No comments yet</ThemedText>
              <ThemedText style={styles.emptySub}>
                Start the conversation.
              </ThemedText>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 16 }}
          onEndReached={loadMoreComments}
          onEndReachedThreshold={0.4}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => listRef.current?.scrollToIndex({ index }), 300);
          }}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ padding: 14 }} /> : error ? (
              <TouchableOpacity onPress={load} style={styles.commentsRetry}>
                <Text style={styles.metaAction}>Retry comments</Text>
              </TouchableOpacity>
            ) : null
          }
        />

        <View style={styles.composer}>
          {replyTo && (
            <View style={styles.replyBanner}>
              <Text style={styles.replyBannerText}>
                Replying to @{replyTo.user?.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close" size={16} color="#8e8e8e" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <Image
              source={
                user?.profile_picture?.url
                  ? {
                      uri: generateURL({ url: user.profile_picture.url }),
                    }
                  : require("@/assets/user.png")
              }
              style={styles.composerAvatar}
            />
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="#8e8e8e"
              value={text}
              onChangeText={setText}
              maxLength={2000}
              multiline
            />
            <TouchableOpacity
              onPress={submitComment}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#0095f6" />
              ) : (
                <Text
                  style={[
                    styles.postBtn,
                    !text.trim() && styles.postBtnDisabled,
                  ]}
                >
                  Post
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#262626",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#dbdbdb",
  },
  commentRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  replyRow: {
    paddingLeft: 56,
  },
  highlight: {
    backgroundColor: "rgba(0,149,246,0.08)",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#efefef",
  },
  commentBody: { flex: 1 },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#262626",
  },
  commentUser: {
    fontWeight: "700",
  },
  commentMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#8e8e8e",
  },
  metaAction: {
    fontSize: 12,
    color: "#8e8e8e",
    fontWeight: "600",
  },
  emptyComments: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#262626",
  },
  emptySub: {
    marginTop: 6,
    color: "#8e8e8e",
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#dbdbdb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  replyBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  replyBannerText: {
    fontSize: 12,
    color: "#8e8e8e",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  composerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    color: "#262626",
    paddingVertical: 8,
  },
  postBtn: {
    color: "#0095f6",
    fontWeight: "700",
    fontSize: 14,
    paddingBottom: 8,
  },
  postBtnDisabled: {
    opacity: 0.4,
  },
  commentsRetry: { alignItems: "center", padding: 16 },
});
