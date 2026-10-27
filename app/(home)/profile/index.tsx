import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateURL } from "@/utils/image-utils.utils";
import { useEffect, useState } from "react";
import ProfileImageGrid from "@/components/common/profile-image-grid";
import ProfileMenu from "@/components/common/profile-menu";
import { useGetAllPosts } from "@/hooks/post-hooks.hooks";
import { Post } from "@/types/post.types";
import { useUserStore } from "@/store/store";
import useTheme from "@/hooks/use-theme";

export default function ProfileScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user: profile } = useUserStore();
  const theme = useTheme();

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (profile) {
        const response = await useGetAllPosts({
          data: {
            filterBy: "my",
            filterValue: "",
            limit: "100",
            page: "1",
          },
        });
        setPosts(response?.posts || []);
      }
    };
    fetchUserPosts();
  }, [profile]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <ThemedText style={styles.username} weight="bold">
            {profile?.username || "-"}
          </ThemedText>
          <TouchableOpacity onPress={() => setMenuOpen(true)} hitSlop={10}>
            <Ionicons name="menu-outline" color={theme.colors.text} size={27} />
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={{ backgroundColor: theme.colors.background }} paddingHorizontal={16}>
          <ThemedView
            flexDirection="row"
            justifyContent="center"
            marginTop={20}
          >
            <Image
              source={
                profile?.profile_picture?.url
                  ? { uri: generateURL({ url: profile.profile_picture.url }) }
                  : require("@/assets/user.png")
              }
              defaultSource={require("@/assets/user.png")}
              onError={() => {}}
                style={{
                width: 100,
                height: 100,
                borderRadius: 100,
                  borderWidth: 3,
                  borderColor: theme.colors.primary,
                  padding: 3,
              }}
            />
          </ThemedView>
          <ThemedView>
            <ThemedText
              weight="bold"
              fontSize={20}
              textAlign="center"
              marginTop={10}
            >
              {profile ? `${profile.first_name} ${profile.last_name}` : "-"}
            </ThemedText>
            <ThemedText
              fontSize={12}
              textAlign="center"
              paddingHorizontal={20}
              paddingVertical={5}
            >
              {profile?.bio || "No bio set."}
            </ThemedText>

            <ThemedView
              justifyContent="space-around"
              flexDirection="row"
              gap={50}
              marginTop={20}
            >
              <ThemedView style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <ThemedText textAlign="center" weight="bold" fontSize={20}>
                  {posts?.length || 0}
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Posts
                </ThemedText>
              </ThemedView>
              <ThemedView style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <ThemedText
                  textAlign="center"
                  textTransform="capitalize"
                  weight="bold"
                  fontSize={20}
                >
                  {profile?.gender || "N/A"}
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Gender
                </ThemedText>
              </ThemedView>
              <ThemedView style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <ThemedText textAlign="center" weight="bold" fontSize={20}>
                  {profile?._count?.my_friends || 0}
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Friends
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* A good grid view of images 2 per row */}
            <ProfileImageGrid posts={posts} />
          </ThemedView>
        </ThemedView>
      </ScrollView>
      <ProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0e3e8",
  },
  username: {
    color: "#281a22",
    fontSize: 20,
  },
  statCard: {
    minWidth: 82,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
});
