import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  Text,
  Alert,
  Share,
  Modal,
  TextInput,
} from "react-native";
import { ThemedText } from "../ui/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { PostProps, PostUser } from "@/types/post.types";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import {
  useLikePost,
  useUnlikePost,
  useGetAllLikes,
  useDeletePost,
  useUpdatePost,
} from "@/hooks/post-hooks.hooks";
import { useUserStore } from "@/store/store";
import { toast } from "@/components/lib/toast-manager";

const ACTION_ICON = 26;
const AVATAR_SIZE = 32;

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const TextPost: React.FC<PostProps> = ({ post, onDeleted, onUpdated }) => {
  const { user } = useUserStore();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(!!post?.likedByMe);
  const [likeCount, setLikeCount] = useState(post?._count?.likes || 0);
  const [commentCount, setCommentCount] = useState(
    post?._count?.comments || 0
  );
  const [isLiking, setIsLiking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [savingEdit, setSavingEdit] = useState(false);

  const caption = post?.content || "";
  const isLongCaption = caption.length > 150;
  const shortCaption = isLongCaption ? caption.slice(0, 150) + "..." : caption;
  const username = post?.user?.username || "user";
  const isOwner = user?.id === post?.user?.id || user?.id === post?.userId;

  useEffect(() => {
    setLiked(!!post?.likedByMe);
    setLikeCount(post?._count?.likes || 0);
    setCommentCount(post?._count?.comments || 0);
  }, [post?.id, post?.likedByMe, post?._count?.likes, post?._count?.comments]);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!post.id || !user?.id || post.likedByMe !== undefined) return;
      const res = await useGetAllLikes({ id: post.id });
      const likes = res?.data || [];
      setLikeCount(likes.length);
      setLiked(likes.some((like: PostUser) => like?.id === user.id));
    };
    fetchLikes();
  }, [post.id, post.likedByMe, user?.id]);

  const handleLike = async () => {
    if (isLiking) return;
    const wasLiked = liked;
    const previousCount = likeCount;

    try {
      setIsLiking(true);
      setLiked(!wasLiked);
      setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

      const res = wasLiked
        ? await useUnlikePost({ id: post.id })
        : await useLikePost({ id: post.id });

      if (res?.error || (typeof res === "string" && res.includes("error"))) {
        setLiked(wasLiked);
        setLikeCount(previousCount);
        toast.error("Failed to update like. Please try again.");
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount(previousCount);
      toast.error("Unable to update like. Please check your connection.");
    } finally {
      setIsLiking(false);
    }
  };

  const openComments = () => router.push(`/post/${post.id}` as any);
  const openLikes = () =>
    router.push({ pathname: "/post/likes" as any, params: { id: post.id } });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post on Mi Love: milove://post/${post.id}`,
      });
    } catch {
      // cancelled
    }
  };

  const handleMore = () => {
    if (!isOwner) return;
    Alert.alert("Post options", undefined, [
      {
        text: "Edit",
        onPress: () => {
          setEditContent(post.content || "");
          setEditing(true);
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert("Delete post?", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                const res = await useDeletePost({ id: post.id });
                if (res?.error) {
                  toast.error("Could not delete post");
                  return;
                }
                toast.success("Post deleted");
                onDeleted?.(post.id);
              },
            },
          ]);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const saveEdit = async () => {
    if (!editContent.trim() || savingEdit) return;
    setSavingEdit(true);
    const res = await useUpdatePost({
      id: post.id,
      data: {
        content: editContent.trim(),
        visibility: post.visibility === "friends" ? "friends" : "public",
      },
    });
    setSavingEdit(false);
    if (res?.error) {
      toast.error(res.message || "Could not update post");
      return;
    }
    const updated = res?.data || res?.post || res;
    onUpdated?.(
      updated?.id ? updated : { ...post, content: editContent.trim() }
    );
    setEditing(false);
    toast.success("Post updated");
  };

  return (
    <View style={styles.post}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => {
            if (post?.user?.id) {
              router.push(`/(friends)/view-friends?id=${post.user.id}`);
            }
          }}
          activeOpacity={0.7}
        >
          <Image
            source={
              post?.user?.profile_picture?.url
                ? {
                    uri: generateURL({ url: post.user.profile_picture.url }),
                  }
                : require("@/assets/user.png")
            }
            style={styles.avatar}
            defaultSource={require("@/assets/user.png")}
          />
          <ThemedText style={styles.username} numberOfLines={1}>
            {username}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity hitSlop={10} onPress={handleMore}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#262626" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.captionText}>
          {expanded ? caption : shortCaption}
          {isLongCaption && !expanded && (
            <Text style={styles.moreLink} onPress={() => setExpanded(true)}>
              {" "}
              more
            </Text>
          )}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            onPress={handleLike}
            disabled={isLiking}
            activeOpacity={0.6}
            hitSlop={8}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={ACTION_ICON}
              color={liked ? "#ed4956" : "#262626"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openComments} activeOpacity={0.6} hitSlop={8}>
            <Ionicons
              name="chatbubble-outline"
              size={ACTION_ICON - 2}
              color="#262626"
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} activeOpacity={0.6} hitSlop={8}>
            <Ionicons
              name="paper-plane-outline"
              size={ACTION_ICON - 2}
              color="#262626"
            />
          </TouchableOpacity>
        </View>

        <View />
      </View>

      {likeCount > 0 && (
        <TouchableOpacity style={styles.likesRow} onPress={openLikes}>
          <ThemedText style={styles.likesText}>
            {likeCount.toLocaleString()} like{likeCount === 1 ? "" : "s"}
          </ThemedText>
        </TouchableOpacity>
      )}

      {commentCount > 0 && (
        <TouchableOpacity style={styles.viewComments} onPress={openComments}>
          <ThemedText style={styles.viewCommentsText}>
            View all {commentCount} comment{commentCount === 1 ? "" : "s"}
          </ThemedText>
        </TouchableOpacity>
      )}

      {post?.created_at && (
        <ThemedText style={styles.timestamp}>
          {formatRelativeTime(post.created_at).toUpperCase()}
        </ThemedText>
      )}
      <Modal
        visible={editing}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editCard}>
            <ThemedText style={styles.editTitle}>Edit post</ThemedText>
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              multiline
              maxLength={500}
              style={styles.editInput}
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                disabled={!editContent.trim() || savingEdit}
              >
                <ThemedText style={styles.saveText}>
                  {savingEdit ? "Saving..." : "Save"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TextPost;

const styles = StyleSheet.create({
  post: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#efefef",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#dbdbdb",
  },
  username: {
    fontSize: 13,
    fontWeight: "600",
    color: "#262626",
    flexShrink: 1,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    minHeight: 48,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#262626",
    fontFamily: "Quicksand_500Medium",
  },
  moreLink: {
    fontSize: 14,
    color: "#8e8e8e",
    fontFamily: "Quicksand_500Medium",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 6,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  likesRow: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  likesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  viewComments: {
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  viewCommentsText: {
    fontSize: 14,
    color: "#8e8e8e",
  },
  timestamp: {
    paddingHorizontal: 12,
    marginTop: 4,
    fontSize: 10,
    letterSpacing: 0.2,
    color: "#8e8e8e",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  editCard: { backgroundColor: "#fff", borderRadius: 16, padding: 18 },
  editTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  editInput: {
    minHeight: 110,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#dbdbdb",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    color: "#262626",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginTop: 16,
  },
  cancelText: { color: "#8e8e8e", fontWeight: "600" },
  saveText: { color: "#0095f6", fontWeight: "700" },
});
