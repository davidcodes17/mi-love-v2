import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import { generateURL } from "@/utils/image-utils.utils";
import { useUserStore } from "@/store/store";
import {
  useDeleteStatus,
  useGetFriendsStatuses,
  useGetMyStatuses,
} from "@/hooks/status-hooks.hooks";
import {
  normalizeStatusGroups,
  StatusGroup,
} from "@/types/status.types";
import { toast } from "@/components/lib/toast-manager";

const { width: W, height: H } = Dimensions.get("window");

export default function ViewStatusScreen() {
  const { userId, startIndex } = useLocalSearchParams<{
    userId?: string;
    startIndex?: string;
  }>();
  const { user } = useUserStore();
  const [groups, setGroups] = useState<StatusGroup[]>([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [friendsRes, myRes] = await Promise.all([
        useGetFriendsStatuses({ page: "1", limit: "30" }),
        useGetMyStatuses(),
      ]);
      if (friendsRes?.error && myRes?.error) {
        throw new Error(friendsRes.message || myRes.message);
      }
      const normalized = normalizeStatusGroups(friendsRes, myRes, user);
      setGroups(normalized);
      const idx = Math.max(
        0,
        normalized.findIndex((g) => g.userId === userId)
      );
      setGroupIndex(idx === -1 ? 0 : idx);
      const requested = Number(startIndex || 0);
      const maxStatus = Math.max(0, (normalized[idx]?.statuses?.length || 1) - 1);
      setStatusIndex(Math.min(Math.max(0, requested), maxStatus));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load stories"
      );
    } finally {
      setLoading(false);
    }
  }, [user, userId, startIndex]);

  useEffect(() => {
    load();
  }, [load]);

  const currentGroup = groups[groupIndex];
  const statuses = currentGroup?.statuses || [];
  const current = statuses[statusIndex];

  useEffect(() => {
    if (!current || loading) return;
    setProgress(0);
    const start = Date.now();
    const duration = 5000;
    const timer = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        goNext();
      }
    }, 50);
    return () => clearInterval(timer);
  }, [current?.id, groupIndex, statusIndex, loading]);

  const goNext = () => {
    if (statusIndex < statuses.length - 1) {
      setStatusIndex((i) => i + 1);
      return;
    }
    if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStatusIndex(0);
      return;
    }
    router.back();
  };

  const goPrev = () => {
    if (statusIndex > 0) {
      setStatusIndex((i) => i - 1);
      return;
    }
    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((i) => i - 1);
      setStatusIndex(Math.max(0, (prevGroup?.statuses?.length || 1) - 1));
      return;
    }
    router.back();
  };

  const handleDelete = async () => {
    if (!current?.id || currentGroup?.userId !== user?.id) return;
    const res = await useDeleteStatus({ id: current.id });
    if (res?.error) {
      toast.error("Could not delete story");
      return;
    }
    toast.success("Story deleted");
    const nextGroups = groups
      .map((group) =>
        group.userId === currentGroup.userId
          ? {
              ...group,
              statuses: group.statuses.filter(
                (status) => status.id !== current.id
              ),
            }
          : group
      )
      .filter((group) => group.statuses.length > 0);
    if (!nextGroups.length) {
      router.back();
      return;
    }
    setGroups(nextGroups);
    const nextGroupIndex = Math.min(groupIndex, nextGroups.length - 1);
    setGroupIndex(nextGroupIndex);
    setStatusIndex((index) =>
      Math.min(index, nextGroups[nextGroupIndex].statuses.length - 1)
    );
  };

  const mediaUrl = current?.file?.url;
  const isMine = currentGroup?.userId === user?.id;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.empty}>{error || "No stories to show"}</Text>
        <TouchableOpacity onPress={error ? load : () => router.back()}>
          <Text style={styles.link}>{error ? "Retry" : "Go back"}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {mediaUrl ? (
        current.file?.type?.toLowerCase().includes("video") ||
        /\.(mp4|mov|webm)(\?|$)/i.test(mediaUrl) ? (
          <Video
            source={{ uri: generateURL({ url: mediaUrl }) }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
          />
        ) : (
          <Image
            source={{ uri: generateURL({ url: mediaUrl }) }}
            style={styles.media}
            resizeMode="cover"
          />
        )
      ) : (
        <View style={styles.textStory}>
          <Text style={styles.textStoryContent}>{current.content}</Text>
        </View>
      )}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.progressRow}>
          {statuses.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      i < statusIndex
                        ? "100%"
                        : i === statusIndex
                          ? `${progress * 100}%`
                          : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.topBar}>
          <View style={styles.userRow}>
            <Image
              source={
                currentGroup.user?.profile_picture?.url
                  ? {
                      uri: generateURL({
                        url: currentGroup.user.profile_picture.url,
                      }),
                    }
                  : require("@/assets/user.png")
              }
              style={styles.avatar}
            />
            <Text style={styles.username}>
              {isMine ? "Your story" : currentGroup.user?.username}
            </Text>
          </View>
          <View style={styles.topActions}>
            {isMine && (
              <TouchableOpacity onPress={handleDelete} hitSlop={10}>
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {!!current.content && mediaUrl && (
          <View style={styles.captionBox}>
            <Text style={styles.caption}>{current.content}</Text>
          </View>
        )}
      </SafeAreaView>

      <View style={styles.tapZones}>
        <TouchableOpacity style={styles.tapLeft} onPress={goPrev} />
        <TouchableOpacity style={styles.tapRight} onPress={goNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { color: "#fff", marginBottom: 12 },
  link: { color: "#0095f6" },
  media: {
    width: W,
    height: H,
  },
  textStory: {
    flex: 1,
    backgroundColor: "#c13584",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  textStoryContent: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  username: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  captionBox: {
    position: "absolute",
    bottom: 48,
    left: 16,
    right: 16,
  },
  caption: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 1,
  },
  tapLeft: { flex: 1 },
  tapRight: { flex: 1 },
});
