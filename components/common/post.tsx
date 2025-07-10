import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { Heart } from "iconsax-react-native";
import { PostProps } from "@/types/post.types";
import { generateURL } from "@/utils/image-utils.utils";
import { useGetProfile } from "@/hooks/auth-hooks.hooks";
import { useUserProfileStore } from "@/hooks/auth-hooks.hooks";
import {
  useLikePost,
  useUnlikePost,
  useGetAllLikes,
} from "@/hooks/post-hooks.hooks";

const Post: React.FC<PostProps> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const [mainImageLoading, setMainImageLoading] = useState(true);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const toggleExpanded = () => setExpanded(!expanded);
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const profile = useUserProfileStore((state) => state.profile);

  const shortText =
    post?.content.length > 70
      ? post?.content.slice(0, 70) + "..."
      : post?.content;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await useGetProfile();
        if (profile) setProfile(profile);
      } catch (e) {
        // handle error if needed
      }
    };
    fetchProfile();
  }, [setProfile]);

  useEffect(() => {
    const fetchLikes = async () => {
      const response = await useGetAllLikes({ id: post.id });
      setLikeCount(response?.data?.length || 0);
      
      // Check if current user has already liked this post
      if (response?.data && profile?.id) {
        const userLiked = response.data.some((like: any) => like.userId === profile.id);
        setLiked(userLiked);
      }
    };
    fetchLikes();
  }, [post.id, profile?.id]);

  const handleLike = async () => {
    if (liked) {
      await useUnlikePost({ id: post.id });
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await useLikePost({ id: post.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  return (
    <ThemedView position="relative" marginBottom={20}>
      <Image
        source={
          mainImageLoading
            ? require("@/assets/user.png")
            : { uri: generateURL({ url: post?.files[0]?.url }) }
        }
        style={{
          width: "100%",
          height: 400,
          borderRadius: 20,
        }}
        onLoadEnd={() => setMainImageLoading(false)}
        resizeMode="cover"
      />

      <ThemedView
        position="absolute"
        bottom={0}
        left={0}
        width={"100%"}
        backgroundColor={"rgba(0, 0, 0, 0.7)"}
        borderRadius={20}
        padding={20}
      >
        <ThemedView
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <ThemedView
            flexDirection="row"
            alignItems="center"
            gap={10}
            marginBottom={5}
          >
            <Image
              source={
                profileImageLoading
                  ? require("@/assets/user.png")
                  : {
                      uri: generateURL({
                        url: post?.user?.profile_picture?.url,
                      }),
                    }
              }
              style={{
                width: 50,
                height: 50,
                borderRadius: 200,
              }}
              onLoadEnd={() => setProfileImageLoading(false)}
              resizeMode="cover"
            />
            <ThemedView>
              <ThemedText fontSize={15} weight="bold" color={"#fff"}>
                {`${post?.user?.first_name} ${post?.user?.last_name}`}
              </ThemedText>
              <ThemedText weight="light" color={"#fff"}>
                @{post?.user?.username}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView flexDirection="row" alignItems="center" gap={10}>
            <TouchableOpacity
            //  onPress={onAddFriend} disabled={!onAddFriend}
            >
              <ThemedText
                backgroundColor={COLORS.primary}
                color={"#fff"}
                padding={7.5}
                borderRadius={200}
                fontSize={12}
                paddingHorizontal={15}
              >
                Add Friend
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLike}>
              <ThemedView
                borderColor={liked ? COLORS.primary : "#fff"}
                borderWidth={0.5}
                padding={5}
                borderRadius={200}
                flexDirection="row"
                alignItems="center"
                gap={5}
              >
                <Heart
                  size={18}
                  color={liked ? COLORS.primary : "#fff"}
                  variant={liked ? "Bold" : undefined}
                />
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ThemedView paddingBottom={10} alignItems="center">
          <ThemedText fontSize={12} color={"#fff"} flexWrap={"wrap"}>
            {expanded ? post?.content : shortText}{" "}
            {post?.content.length > 70 && (
              <TouchableOpacity onPress={toggleExpanded}>
                <ThemedText color={COLORS.primary} fontSize={12}>
                  {expanded ? "Less" : "More"}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default Post;

const styles = StyleSheet.create({});
