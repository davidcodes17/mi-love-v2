import React, { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { Href, Link } from "expo-router";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { Heart } from "iconsax-react-native";
import { generateURL } from "@/utils/image-utils.utils";
import { Post } from "@/types/post.types";
import { useGetAllLikes } from "@/hooks/post-hooks.hooks";
import { useUserProfileStore } from "@/hooks/auth-hooks.hooks";

interface ProfileImageGridProps {
  posts: Post[];
  linkBase: string;
}

const ProfileImageGrid: React.FC<ProfileImageGridProps> = ({
  posts,
  linkBase,
}) => {
  const [likes, setLikes] = useState<number[]>([]);
  const profile = useUserProfileStore((state) => state.profile);

  useEffect(() => {
    const fetchAllLikes = async () => {
      const likesArr = await Promise.all(
        posts.map(async (post) => {
          try {
            const response = await useGetAllLikes({ id: post.id });
            return response?.data?.length || 0;
          } catch {
            return 0;
          }
        })
      );
      setLikes(likesArr);
    };
    if (posts.length > 0) fetchAllLikes();
  }, [posts, profile?.id]);

  return (
    <ThemedView
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="space-between"
      marginTop={20}
    >
      {posts.map((post, idx) => (
        <Link href={`${linkBase}/${idx}` as Href} asChild key={post.id}>
          <View
            style={{
              width: "48%",
              aspectRatio: 1,
              marginBottom: 12,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#eee",
              position: "relative",
            }}
          >
            <Image
              source={{ uri: generateURL({ url: post.files[0]?.url }) }}
              style={{ width: "100%", height: 200 }}
              resizeMode="cover"
            />
            <ThemedView
              position="absolute"
              flexDirection="row"
              left={20}
              bottom={10}
              alignItems="center"
              gap={2}
            >
              <ThemedText color={"#fff"} fontSize={20}>
                {post?._count?.likes || 0}
              </ThemedText>
              <Heart color={"white"} variant="Bold" size={20} />
            </ThemedView>
          </View>
        </Link>
      ))}
    </ThemedView>
  );
};

export default ProfileImageGrid;
