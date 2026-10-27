import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { generateURL } from "@/utils/image-utils.utils";
import { Post } from "@/types/post.types";

interface ProfileImageGridProps {
  posts: Post[];
  emptyTitle?: string;
  emptySubtitle?: string;
  linkBase?: string;
}

const GAP = 1;
const COLS = 3;
const SCREEN_W = Dimensions.get("window").width;
const TILE = (SCREEN_W - GAP * (COLS - 1)) / COLS;

const isVideo = (file?: { url?: string; type?: string; thumbnailUrl?: string }) => {
  const type = (file?.type || "").toLowerCase();
  const url = (file?.url || "").toLowerCase();
  return (
    type.includes("video") ||
    url.endsWith(".mp4") ||
    url.endsWith(".mov") ||
    url.endsWith(".webm")
  );
};

const ProfileImageGrid: React.FC<ProfileImageGridProps> = ({
  posts,
  emptyTitle = "No Posts Yet",
  emptySubtitle = "When you share photos, they'll appear on your profile.",
}) => {
  if (!posts.length) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyRing}>
          <Ionicons name="camera-outline" size={40} color="#262626" />
        </View>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {posts.map((post) => {
        const first = post.files?.[0];
        const multi = (post.files?.length || 0) > 1;
        const video = isVideo(first);
        const uri =
          video && first?.thumbnailUrl
            ? generateURL({ url: first.thumbnailUrl })
            : first?.url
              ? generateURL({ url: first.url })
              : null;

        return (
          <TouchableOpacity
            key={post.id}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/post/[id]",
                params: { id: post.id },
              })
            }
            style={styles.tile}
          >
            <Image
              source={uri ? { uri } : require("@/assets/post.jpg")}
              style={styles.image}
              resizeMode="cover"
            />
            {multi && !video && (
              <View style={styles.badge}>
                <Ionicons name="copy-outline" size={14} color="#fff" />
              </View>
            )}
            {video && (
              <View style={styles.badge}>
                <Ionicons name="play" size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ProfileImageGrid;

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    backgroundColor: "#fff",
  },
  tile: {
    width: TILE,
    height: TILE,
    backgroundColor: "#efefef",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  empty: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 40,
  },
  emptyRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    borderColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#262626",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8e8e8e",
    textAlign: "center",
    lineHeight: 18,
  },
});
