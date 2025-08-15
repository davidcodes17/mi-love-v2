import BackButton from "@/components/common/back-button";
import globalStyles from "@/components/styles/global-styles";
import NativeButton from "@/components/ui/native-button";
import NativeText from "@/components/ui/native-text";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { Heart, More, MoreCircle } from "iconsax-react-native";
import { ScrollView, TouchableOpacity } from "react-native";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, Link, router } from "expo-router";
import { useGetProfile, useUserProfileStore } from "@/hooks/auth-hooks.hooks";
import { generateURL } from "@/utils/image-utils.utils";
import { useEffect, useState } from "react";
import { UserProfileR } from "@/types/auth.types";
import ProfileImageGrid from "@/components/common/profile-image-grid";
import { useGetAllPosts } from "@/hooks/post-hooks.hooks";
import { Post } from "@/types/post.types";
import { getAge } from "@/utils/age-utils.utils";

export default function ProfileScreen() {
  const [profile, setUser] = useState<UserProfileR>(null!);
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchMe = async () => {
    const response = await useGetProfile();
    console.log(response);
    setUser(response?.data);
  };

  useEffect(() => {
    fetchMe();
    console.log("SJSJ");
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (profile) {
        const response = await useGetAllPosts({
          data: {
            filterBy: "",
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <BackButton />
          <ThemedText weight="bold">{profile?.username || "-"}</ThemedText>
          <TouchableOpacity onPress={()=>{
            router.push("/settings")
          }}>
            <ThemedView>
              <More variant="Outline" color="#000" size={30} />
            </ThemedView>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView>
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
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
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
              <ThemedView>
                <ThemedText textAlign="center" weight="medium" fontSize={20}>
                  {posts?.length || 0}
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Posts
                </ThemedText>
              </ThemedView>
              <ThemedView>
                <ThemedText textAlign="center" textTransform="capitalize" weight="medium" fontSize={20}>
                  {profile?.gender || "N/A"}
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Gender
                </ThemedText>
              </ThemedView>
              <ThemedView>
                <ThemedText textAlign="center" weight="medium" fontSize={20}>
                  {profile?._count.my_friends || 0}
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Friends
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* A good grid view of images 2 per row */}
            <ProfileImageGrid posts={posts} linkBase="/(home)/view-friend" />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
