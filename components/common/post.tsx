import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { AddCircle, Heart, LogoutCurve } from "iconsax-react-native";
import { LikesResponse, PostProps, PostUser } from "@/types/post.types";
import { generateURL } from "@/utils/image-utils.utils";
import { useGetProfile } from "@/hooks/auth-hooks.hooks";
import { router } from "expo-router";
import {
  useLikePost,
  useUnlikePost,
  useGetAllLikes,
} from "@/hooks/post-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import {
  useAddFriend,
  useGetAllFriends,
  useUnFriend,
} from "@/hooks/friend-hooks.hooks";
import { UserProfileR } from "@/types/auth.types";

const Post: React.FC<PostProps> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const [mainImageLoading, setMainImageLoading] = useState(true);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?._count?.likes || 0);
  const [user, setUser] = useState<UserProfileR>(null!);
  const [isFriend, setIsFriend] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [likesResponse, setLikesResponse] = useState<LikesResponse>(null!);
  const [isLiking, setIsLiking] = useState(false);
  const handleScroll = (event: any) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x /
      event.nativeEvent.layoutMeasurement.width
    );
    setCurrentImage(index);
  };

  const toggleExpanded = () => setExpanded(!expanded);
  const shortText =
    post?.content.length > 70
      ? post.content.slice(0, 70) + "..."
      : post.content;

  const windowWidth = Dimensions.get("window").width;
  const horizontalPadding = 20; // Matches ThemedView paddingHorizontal
  const galleryWidth = windowWidth - horizontalPadding * 2;

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
      setLikesResponse(res);

      // ✅ fix detection logic
      if (user?.id) {
        const userLiked = likes.some(
          (like: PostUser) => like?.id === user.id // use nested user.id if backend returns user object
        );
        setLiked(userLiked);
      }
    };
    if (user?.id) {
      fetchLikes();
    }
  }, [post.id, user?.id]);


  const handleLike = async () => {
    // Prevent multiple simultaneous requests
    if (isLiking || !user?.id) return;

    const wasLiked = liked;
    const previousCount = likeCount;

    try {
      setIsLiking(true);

      // Optimistic update
      if (wasLiked) {
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        setLiked(true);
        setLikeCount((c) => c + 1);
      }

      // Make API call
      const res = wasLiked
        ? await useUnlikePost({ id: post.id })
        : await useLikePost({ id: post.id });

      // Check if response is an error
      if (res?.error || (typeof res === 'string' && res.includes('error'))) {
        // Rollback optimistic update
        setLiked(wasLiked);
        setLikeCount(previousCount);
        toast.error("Failed to update like. Please try again.");
        return;
      }

      // Success - state already updated optimistically
    } catch (err: any) {
      // Rollback optimistic update on error
      setLiked(wasLiked);
      setLikeCount(previousCount);
      console.error("Error toggling like:", err);
      toast.error("Unable to update like. Please check your connection.");
    } finally {
      setIsLiking(false);
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
      {/* Image Gallery */}
      <View
        style={{
          width: galleryWidth,
          height: 400,
          borderRadius: 20,
          overflow: "hidden",
          alignSelf: "center",
        }}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: galleryWidth }}
        >
          {post.files && post.files.length > 0 ? (
            post.files.map((file, idx) => (
              <Image
                key={file.url + idx}
                source={
                  mainImageLoading
                    ? require("@/assets/post.jpg")
                    : { uri: generateURL({ url: file.url }) }
                }
                style={{ width: galleryWidth, height: 400 }}
                onLoadEnd={() => setMainImageLoading(false)}
                resizeMode="cover"
              />
            ))
          ) : (
            <Image
              source={require("@/assets/user.png")}
              style={{ width: galleryWidth, height: 400 }}
              resizeMode="cover"
            />
          )}
        </ScrollView>
        {/* Pagination Dots */}
        {post.files && post.files.length > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {post.files.map((_, idx) => (
              <View
                key={"dot-" + idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 3,
                  backgroundColor:
                    currentImage === idx ? COLORS.primary : "#fff",
                  opacity: 0.8,
                }}
              />
            ))}
          </View>
        )}
      </View>

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
          <TouchableOpacity
            onPress={() => {
              if (post?.user?.id) {
                router.push(`/(friends)/view-friends?id=${post.user.id}`);
              }
            }}
            activeOpacity={0.7}
          >
            <ThemedView
              flexDirection="row"
              alignItems="center"
              gap={10}
              marginBottom={5}
            >
              <Image
                source={
                  profileImageLoading || !post?.user?.profile_picture?.url
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
                onError={() => setProfileImageLoading(true)}
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
          </TouchableOpacity>

          {/* Buttons */}
          <ThemedView flexDirection="row" alignItems="center" gap={10}>
            {user?.email !== post?.user?.email &&
              (isFriend ? (
                <TouchableOpacity onPress={onUnfriend}>
                  <LogoutCurve color="#fff" size={24} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={onAddFriend}>
                  <AddCircle color="#fff" size={24} />
                </TouchableOpacity>
              ))}

            {/* Like button */}
            <TouchableOpacity
              onPress={handleLike}
              disabled={isLiking}
              activeOpacity={0.7}
            >
              <ThemedView
                borderColor={"#fff"}
                borderWidth={1}
                padding={5}
                borderRadius={200}
                flexDirection="row"
                alignItems="center"
                gap={10}
                opacity={isLiking ? 0.6 : 1}
              >
                <Heart
                  size={15}
                  color={"#fff"}
                  variant={liked ? "Bold" : "Outline"}
                />
                <ThemedText color={"#fff"} fontSize={12}>
                  {likeCount}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>

          </ThemedView>
        </ThemedView>

        {/* Post content */}
        <ThemedView paddingBottom={10}>
          <ThemedText
            fontSize={13}
            color="#fff"
            flexWrap="wrap"
            lineHeight={18}
          >
            {expanded ? post?.content : shortText}
            {post?.content.length > 70 && (
              <TouchableOpacity onPress={toggleExpanded}>
                <ThemedText
                  color={COLORS.primary}
                  fontSize={13}
                  fontWeight="600"
                  marginLeft={4}
                >
                  {expanded ? " ✦ show less" : " ✦ read more"}
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
