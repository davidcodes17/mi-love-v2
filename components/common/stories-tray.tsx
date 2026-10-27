import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedText } from "@/components/ui/themed-view";
import { generateURL } from "@/utils/image-utils.utils";
import { useUserStore } from "@/store/store";
import {
  useGetFriendsStatuses,
  useGetMyStatuses,
} from "@/hooks/status-hooks.hooks";
import {
  normalizeStatusGroups,
  StatusGroup,
} from "@/types/status.types";

const RING = 68;
const AVATAR = 60;

type StoriesTrayProps = {
  refreshKey?: number;
};

const StoriesTray = ({ refreshKey = 0 }: StoriesTrayProps) => {
  const { user } = useUserStore();
  const [groups, setGroups] = useState<StatusGroup[]>([]);
  const [loading, setLoading] = useState(true);
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
      setGroups(normalizeStatusGroups(friendsRes, myRes, user, true));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load stories");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const openCreate = () => router.push("/status/create" as any);
  const openView = (group: StatusGroup) => {
    if (!group.statuses?.length && group.userId === user?.id) {
      openCreate();
      return;
    }
    if (!group.statuses?.length) return;

    router.push({
      pathname: "/status/view" as any,
      params: {
        userId: group.userId,
        startIndex: "0",
      },
    });
  };

  if (loading && groups.length === 0) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color="#262626" />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {groups.map((group, idx) => {
          const isMe = group.userId === user?.id;
          const hasStory = (group.statuses?.length || 0) > 0;
          const avatarUrl = group.user?.profile_picture?.url;
          const label = isMe ? "Your story" : group.user?.username || "user";

          return (
            <TouchableOpacity
              key={group.userId || idx}
              style={styles.item}
              activeOpacity={0.8}
              onPress={() => openView(group)}
              onLongPress={isMe ? openCreate : undefined}
            >
              <View
                style={[
                  styles.ring,
                  hasStory ? styles.ringActive : styles.ringIdle,
                ]}
              >
                <Image
                  source={
                    avatarUrl
                      ? { uri: generateURL({ url: avatarUrl }) }
                      : require("@/assets/user.png")
                  }
                  style={styles.avatar}
                />
                {isMe && (
                  <View style={styles.addBadge}>
                    <Ionicons name="add" size={14} color="#fff" />
                  </View>
                )}
              </View>
              <ThemedText style={styles.label} numberOfLines={1}>
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}

        {/* Ensure "Your story" always exists even with empty my statuses */}
        {!groups.some((g) => g.userId === user?.id) && user && (
          <TouchableOpacity
            style={styles.item}
            activeOpacity={0.8}
            onPress={openCreate}
          >
            <View style={[styles.ring, styles.ringIdle]}>
              <Image
                source={
                  user.profile_picture?.url
                    ? {
                        uri: generateURL({ url: user.profile_picture.url }),
                      }
                    : require("@/assets/user.png")
                }
                style={styles.avatar}
              />
              <View style={styles.addBadge}>
                <Ionicons name="add" size={14} color="#fff" />
              </View>
            </View>
            <ThemedText style={styles.label} numberOfLines={1}>
              Your story
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
      {!!error && (
        <TouchableOpacity onPress={load} style={styles.errorRow}>
          <ThemedText style={styles.errorText}>{error} · Retry</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StoriesTray;

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  loadingRow: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
  },
  row: {
    paddingHorizontal: 12,
    gap: 14,
  },
  item: {
    width: RING,
    alignItems: "center",
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  ringActive: {
    borderWidth: 2,
    borderColor: "#c13584",
  },
  ringIdle: {
    borderWidth: 1.5,
    borderColor: "#dbdbdb",
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: "#efefef",
  },
  addBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0095f6",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    color: "#262626",
    textAlign: "center",
    width: RING + 4,
  },
  errorRow: { alignItems: "center", paddingTop: 8 },
  errorText: { color: "#ed4956", fontSize: 12 },
});
