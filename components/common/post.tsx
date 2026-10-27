import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
  Alert,
  Share,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ThemedText } from "../ui/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { PostProps, PostUser, ProfilePicture } from "@/types/post.types";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import {
  useLikePost,
  useUnlikePost,
  useGetAllLikes,
  useDeletePost,
  useUpdatePost,
} from "@/hooks/post-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import {
  useAddFriend,
  useGetAllFriends,
  useUnFriend,
} from "@/hooks/friend-hooks.hooks";
import { useUserStore } from "@/store/store";
import { usePreferencesStore } from "@/store/preferences-store";
import useTheme from "@/hooks/use-theme";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const AVATAR_SIZE = 32;
const ACTION_ICON = 26;
/** Soft cap so ultra-tall media still fits the feed without cropping. */
const MAX_MEDIA_HEIGHT = Math.min(WINDOW_WIDTH * 1.35, WINDOW_HEIGHT * 0.72);
const MIN_MEDIA_HEIGHT = WINDOW_WIDTH * 0.45;

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(days / 7);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 5) return `${weeks}w`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const isVideoFile = (file: { url?: string; type?: string }) => {
  const type = (file.type || "").toLowerCase();
  const url = (file.url || "").toLowerCase();
  return (
    type.includes("video") ||
    url.endsWith(".mp4") ||
    url.endsWith(".mov") ||
    url.endsWith(".webm") ||
    url.includes("/video")
  );
};

const mediaHeightFromSize = (w: number, h: number) => {
  if (!w || !h) return WINDOW_WIDTH;
  const natural = WINDOW_WIDTH * (h / w);
  return Math.max(MIN_MEDIA_HEIGHT, Math.min(MAX_MEDIA_HEIGHT, natural));
};

type SlideProps = {
  file: ProfilePicture;
  height: number;
  active: boolean;
  onReadySize: (w: number, h: number) => void;
};

const MediaSlide = ({ file, height, active, onReadySize }: SlideProps) => {
  const video = isVideoFile(file);
  const uri = generateURL({ url: file.url });
  const poster = file.thumbnailUrl
    ? generateURL({ url: file.thumbnailUrl })
    : undefined;
  const muteByDefault = usePreferencesStore((s) => s.muteVideosByDefault);
  const autoplayVideos = usePreferencesStore((s) => s.autoplayVideos);
  const [muted, setMuted] = useState(muteByDefault);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (!video) return;
    if (poster) {
      Image.getSize(
        poster,
        (w, h) => onReadySize(w, h),
        () => onReadySize(WINDOW_WIDTH, WINDOW_WIDTH)
      );
    } else {
      onReadySize(WINDOW_WIDTH, WINDOW_WIDTH);
    }
  }, [video, poster, onReadySize]);

  useEffect(() => {
    if (!video) {
      Image.getSize(
        uri,
        (w, h) => {
          onReadySize(w, h);
          setLoading(false);
        },
        () => {
          onReadySize(WINDOW_WIDTH, WINDOW_WIDTH);
          setLoading(false);
        }
      );
    }
  }, [uri, video, onReadySize]);

  if (video) {
    return (
      <View style={[styles.mediaSlide, { height }]}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={{ width: WINDOW_WIDTH, height }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={active && autoplayVideos}
          isLooping
          isMuted={muted}
          posterSource={poster ? { uri: poster } : undefined}
          usePoster={!!poster}
          onReadyForDisplay={(event) => {
            const nw = (event as any)?.naturalSize?.width;
            const nh = (event as any)?.naturalSize?.height;
            if (nw && nh) onReadySize(nw, nh);
            setLoading(false);
          }}
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            if (status.isPlaying) setLoading(false);
          }}
        />
        {loading && (
          <View style={styles.mediaLoader}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
        <TouchableOpacity
          style={styles.muteBtn}
          onPress={() => setMuted((m) => !m)}
          hitSlop={10}
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.mediaSlide, { height }]}>
      <Image
        source={{ uri }}
        style={{ width: WINDOW_WIDTH, height }}
        resizeMode="contain"
        onLoad={(e) => {
          const { width, height: ih } = e.nativeEvent.source;
          if (width && ih) onReadySize(width, ih);
          setLoading(false);
        }}
      />
      {loading && (
        <View style={styles.mediaLoader}>
          <ActivityIndicator color="#8e8e8e" />
        </View>
      )}
    </View>
  );
};

const Post: React.FC<PostProps> = ({ post, onDeleted, onUpdated }) => {
  const { user } = useUserStore();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(!!post?.likedByMe);
  const [likeCount, setLikeCount] = useState(post?._count?.likes || 0);
  const [commentCount, setCommentCount] = useState(
    post?._count?.comments || 0
  );
  const [isFriend, setIsFriend] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slideHeights, setSlideHeights] = useState<Record<number, number>>({});
  const lastTap = useRef(0);
  const [heartBurst, setHeartBurst] = useState(false);

  const files = post.files || [];
  const hasMultiple = files.length > 1;
  const caption = post?.content || "";
  const isLongCaption = caption.length > 105;
  const shortCaption = isLongCaption ? caption.slice(0, 105) + "..." : caption;
  const username = post?.user?.username || "user";
  const isOwner = user?.id === post?.user?.id || user?.id === post?.userId;

  const mediaHeight = useMemo(() => {
    const current = slideHeights[currentImage];
    if (current) return current;
    const first = Object.values(slideHeights)[0];
    return first || WINDOW_WIDTH;
  }, [slideHeights, currentImage]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width
    );
    setCurrentImage(index);
  };

  const setReadySize = (index: number) => (w: number, h: number) => {
    const next = mediaHeightFromSize(w, h);
    setSlideHeights((prev) => {
      if (prev[index] && Math.abs(prev[index] - next) < 2) return prev;
      return { ...prev, [index]: next };
    });
  };

  useEffect(() => {
    setLiked(!!post?.likedByMe);
    setLikeCount(post?._count?.likes || 0);
    setCommentCount(post?._count?.comments || 0);
  }, [post?.id, post?.likedByMe, post?._count?.likes, post?._count?.comments]);

  useEffect(() => {
    const fetchFriendsAndLikes = async () => {
      if (!post.user?.id) return;

      if (user?.id && post.likedByMe === undefined) {
        const res = await useGetAllLikes({ id: post.id });
        const likes = res?.data || [];
        setLikeCount(likes.length);
        setLiked(likes.some((like: PostUser) => like?.id === user.id));
      }

      if (user?.email && user.email !== post.user.email) {
        const friendsRes = await useGetAllFriends({
          filterBy: { filterBy: "friends" },
        });
        if (friendsRes?.data) {
          setIsFriend(friendsRes.data.some((f: any) => f.id === post.user.id));
        }
      }
    };
    fetchFriendsAndLikes();
  }, [post.id, post.user?.id, post.user?.email, post.likedByMe, user?.id]);

  const handleLike = async (forceLike = false) => {
    if (isLiking || !user?.id) return;
    if (forceLike && liked) return;

    const wasLiked = liked;
    const previousCount = likeCount;
    const nextLiked = forceLike ? true : !wasLiked;

    try {
      setIsLiking(true);
      setLiked(nextLiked);
      setLikeCount((c) => {
        if (forceLike) return wasLiked ? c : c + 1;
        return wasLiked ? Math.max(0, c - 1) : c + 1;
      });

      const res = nextLiked
        ? wasLiked && forceLike
          ? { ok: true }
          : await useLikePost({ id: post.id })
        : await useUnlikePost({ id: post.id });

      if (
        res &&
        (res?.error || (typeof res === "string" && res.includes("error")))
      ) {
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

  const onDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      setHeartBurst(true);
      handleLike(true);
      setTimeout(() => setHeartBurst(false), 700);
    }
    lastTap.current = now;
  };

  const onAddFriend = async () => {
    await useAddFriend({ id: post.user.id });
    setIsFriend(true);
  };

  const onUnfriend = async () => {
    await useUnFriend({ id: post.user.id });
    setIsFriend(false);
  };

  const goToProfile = () => {
    if (post?.user?.id) {
      router.push(`/(friends)/view-friends?id=${post.user.id}`);
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
    const buttons: any[] = [];

    if (isOwner) {
      buttons.push({
        text: "Edit",
        onPress: () => {
          setEditContent(post.content || "");
          setEditing(true);
        },
      });
      buttons.push({
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
      });
    } else {
      buttons.push(
        isFriend
          ? { text: "Unfollow", onPress: onUnfriend }
          : { text: "Follow", onPress: onAddFriend }
      );
    }

    buttons.push({ text: "Cancel", style: "cancel" });
    Alert.alert("", undefined, buttons);
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
    <View style={[styles.post, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={goToProfile}
          activeOpacity={0.7}
        >
          <View style={styles.avatarRing}>
            <Image
              source={
                post?.user?.profile_picture?.url
                  ? {
                      uri: generateURL({
                        url: post.user.profile_picture.url,
                      }),
                    }
                  : require("@/assets/user.png")
              }
              style={styles.avatar}
              defaultSource={require("@/assets/user.png")}
            />
          </View>
          <ThemedText style={[styles.username, { color: theme.colors.text }]} numberOfLines={1}>
            {username}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity hitSlop={10} style={styles.moreBtn} onPress={handleMore}>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.muted} />
        </TouchableOpacity>
      </View>

      <Pressable onPress={onDoubleTap}>
        <View style={[styles.media, { height: mediaHeight }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            style={{ width: WINDOW_WIDTH }}
          >
            {files.length > 0 ? (
              files.map((file, idx) => (
                <MediaSlide
                  key={(file.url || "img") + idx}
                  file={file}
                  height={mediaHeight}
                  active={currentImage === idx}
                  onReadySize={setReadySize(idx)}
                />
              ))
            ) : (
              <View style={[styles.mediaSlide, { height: mediaHeight }]}>
                <Image
                  source={require("@/assets/user.png")}
                  style={{ width: WINDOW_WIDTH, height: mediaHeight }}
                  resizeMode="contain"
                />
              </View>
            )}
          </ScrollView>

          {hasMultiple && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImage + 1}/{files.length}
              </Text>
            </View>
          )}

          {heartBurst && (
            <View style={styles.heartBurst} pointerEvents="none">
              <Ionicons name="heart" size={88} color="#fff" />
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.actionsRow}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            onPress={() => handleLike(false)}
            disabled={isLiking}
            activeOpacity={0.6}
            hitSlop={8}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={ACTION_ICON}
              color={liked ? theme.colors.error : theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openComments} activeOpacity={0.6} hitSlop={8}>
            <Ionicons
              name="chatbubble-outline"
              size={ACTION_ICON - 2}
              color={theme.colors.text}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} activeOpacity={0.6} hitSlop={8}>
            <Ionicons
              name="paper-plane-outline"
              size={ACTION_ICON - 2}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsCenter}>
          {hasMultiple &&
            files.map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.dot,
                  currentImage === idx ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
        </View>

        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => setSaved((s) => !s)}
          hitSlop={8}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={ACTION_ICON - 2}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {likeCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.likesRow}
          onPress={openLikes}
        >
          <ThemedText style={[styles.likesText, { color: theme.colors.text }]}>
            {likeCount.toLocaleString()} like{likeCount === 1 ? "" : "s"}
          </ThemedText>
        </TouchableOpacity>
      )}

      {!!caption && (
        <View style={styles.captionRow}>
          <Text style={[styles.captionText, { color: theme.colors.text }]}>
            <Text style={[styles.captionUsername, { color: theme.colors.text }]} onPress={goToProfile}>
              {username}{" "}
            </Text>
            {expanded ? caption : shortCaption}
            {isLongCaption && !expanded && (
                <Text style={[styles.moreLink, { color: theme.colors.muted }]} onPress={() => setExpanded(true)}>
                {" "}
                more
              </Text>
            )}
          </Text>
        </View>
      )}

      {commentCount > 0 && (
        <TouchableOpacity style={styles.viewComments} onPress={openComments}>
          <ThemedText style={[styles.viewCommentsText, { color: theme.colors.muted }]}>
            View all {commentCount} comment{commentCount === 1 ? "" : "s"}
          </ThemedText>
        </TouchableOpacity>
      )}

      {post?.created_at && (
        <TouchableOpacity onPress={openComments}>
          <ThemedText style={[styles.timestamp, { color: theme.colors.muted }]}>
            {formatRelativeTime(post.created_at)}
          </ThemedText>
        </TouchableOpacity>
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
              placeholder="Write a caption..."
              placeholderTextColor="#8e8e8e"
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
                  {savingEdit ? "Saving..." : "Done"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  post: {
    backgroundColor: "#fff",
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0e3e8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatarRing: {
    width: AVATAR_SIZE + 4,
    height: AVATAR_SIZE + 4,
    borderRadius: (AVATAR_SIZE + 4) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#efefef",
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    flexShrink: 1,
  },
  moreBtn: { paddingLeft: 4 },
  media: {
    width: WINDOW_WIDTH,
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  mediaSlide: {
    width: WINDOW_WIDTH,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  muteBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageCounter: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(38,38,38,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 13,
  },
  imageCounterText: {
    color: "#f5f5f5",
    fontSize: 12,
    fontWeight: "600",
  },
  heartBurst: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 44,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: 118,
  },
  actionsCenter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  bookmarkBtn: {
    width: 118,
    alignItems: "flex-end",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: { backgroundColor: "#b8325b" },
  dotInactive: { backgroundColor: "#f0e3e8" },
  likesRow: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  likesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  captionRow: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 18,
    color: "#262626",
  },
  captionUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  moreLink: {
    fontSize: 14,
    color: "#8e8e8e",
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
    fontSize: 12,
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
