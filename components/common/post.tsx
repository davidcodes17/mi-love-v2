import {
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { Heart } from "iconsax-react-native";
import { PostProps } from "@/types/post.types";
import { generateURL } from "@/utils/image-utils.utils";
import { useGetProfile } from "@/hooks/auth-hooks.hooks";
import {
  useLikePost,
  useUnlikePost,
  useGetAllLikes,
} from "@/hooks/post-hooks.hooks";
import { useAddFriend, useGetAllFriends, useUnFriend } from "@/hooks/friend-hooks.hooks";
import { UserProfileR } from "@/types/auth.types";

const Post: React.FC<PostProps> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const [mainImageLoading, setMainImageLoading] = useState(true);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [user, setUser] = useState<UserProfileR>(null!);
  const [isFriend, setIsFriend] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);
  const shortText =
    post?.content.length > 70
      ? post.content.slice(0, 70) + "..."
      : post.content;


  useEffect(() => {
    const fetchUserAndFriends = async () => {
      const profileRes = await useGetProfile();
      if (profileRes?.data) {
        setUser(profileRes.data);
        const friendsRes = await useGetAllFriends({
          filterBy: { filterBy: "friends" },
        });
        if (friendsRes?.data) {
          setIsFriend(friendsRes.data.some((f: any) => f.id === post.user.id));
        }
      }
    };
    fetchUserAndFriends();
  }, [post.user.id]);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!post.id) return;
      const res = await useGetAllLikes({ id: post.id });
      const likes = res?.data || [];
      setLikeCount(likes.length);
      if (user?.id) {
        const userLiked = likes.some((like: any) => like.userId === user.id);
        setLiked(userLiked);
      }
    };
    if (user?.id) {
      fetchLikes();
    }
  }, [post.id, user?.id]);

  const handleLike = async () => {
    try {
      if (!user?.id) return;
      if (liked) {
        const res = await useUnlikePost({ id: post.id });
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        const res = await useLikePost({ id: post.id });
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const onAddFriend = async () => {
    await useAddFriend({ id: post.user.id });
    setIsFriend(true);
  };

  const onUnfriend = async () => {
    await useUnFriend({ id: post.user.id });
    setIsFriend(false);
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
          {/* Profile Info */}
          <ThemedView flexDirection="row" alignItems="center" gap={10} marginBottom={5}>
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

          {/* Buttons */}
          <ThemedView flexDirection="row" alignItems="center" gap={10}>
            {user?.email !== post?.user?.email && (
              isFriend ? (
                <TouchableOpacity onPress={onUnfriend}>
                  <ThemedText
                    backgroundColor={COLORS.primary}
                    color="#fff"
                    padding={7.5}
                    borderRadius={200}
                    fontSize={12}
                    paddingHorizontal={15}
                  >
                    Unfriend
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={onAddFriend}>
                  <ThemedText
                    backgroundColor={COLORS.primary}
                    color="#fff"
                    padding={7.5}
                    borderRadius={200}
                    fontSize={12}
                    paddingHorizontal={15}
                  >
                    Add Friend
                  </ThemedText>
                </TouchableOpacity>
              )
            )}

            {/* Like button */}
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
                  variant={liked ? "Bold" : "Outline"}
                />
                <ThemedText color={liked ? COLORS.primary : "#fff"} fontSize={12}>
                  {likeCount}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Post content */}
        <ThemedView paddingBottom={10} alignItems="center">
          <ThemedText fontSize={12} color="#fff" flexWrap="wrap">
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
