import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { Heart, More, MessageCircle, Share } from "iconsax-react-native";
import { PostProps } from "@/types/post.types";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import {
  useLikePost,
  useUnlikePost,
  useGetAllLikes,
} from "@/hooks/post-hooks.hooks";
import { useUserProfileStore } from "@/hooks/auth-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";

const TextPost: React.FC<PostProps> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?._count?.likes || 0);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const profile = useUserProfileStore((state) => state.profile);

  const shortText =
    post?.content.length > 150
      ? post?.content.slice(0, 150) + "..."
      : post?.content;

  const handleLike = async () => {
    // Prevent multiple simultaneous requests
    if (isLiking) return;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <ThemedView
      backgroundColor="#fff"
      borderRadius={16}
      padding={16}
      marginBottom={16}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
      elevation={3}
    >
      {/* Header */}
      <ThemedView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={12}
      >
        <TouchableOpacity
          onPress={() => {
            if (post?.user?.id) {
              router.push(`/(friends)/view-friends?id=${post.user.id}`);
            }
          }}
          activeOpacity={0.7}
        >
          <ThemedView flexDirection="row" alignItems="center" gap={12}>
            <ThemedView
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor="#f0f0f0"
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
            >
              {post?.user?.profile_picture?.url ? (
                <Image
                  source={{
                    uri: generateURL({ url: post.user.profile_picture.url }),
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                  }}
                  onLoadEnd={() => setProfileImageLoading(false)}
                  onError={() => setProfileImageLoading(true)}
                  defaultSource={require("@/assets/user.png")}
                />
              ) : (
                <Image
                  source={require("@/assets/user.png")}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                  }}
                />
              )}
            </ThemedView>

            <ThemedView>
              <ThemedText fontSize={16} weight="bold" color="#1a1a1a">
                {`${post?.user?.first_name} ${post?.user?.last_name}`}
              </ThemedText>
              <ThemedText fontSize={12} color="#666" marginTop={2}>
                @{post?.user?.username} • {formatDate(post?.created_at)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>

        {/* <TouchableOpacity>
          <More size={20} color="#666" />
        </TouchableOpacity> */}
      </ThemedView>

      {/* Content */}
      <ThemedView marginBottom={16}>
        <ThemedText fontSize={16} lineHeight={24} color="#1a1a1a">
          {expanded ? post?.content : shortText}
        </ThemedText>
        {post?.content.length > 150 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <ThemedText
              color={COLORS.primary}
              fontSize={14}
              weight="medium"
              marginTop={8}
            >
              {expanded ? "Show less" : "Read more"}
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Actions */}
      <ThemedView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingTop={12}
        borderTopWidth={1}
        borderTopColor="#f0f0f0"
      >
        <ThemedView flexDirection="row" alignItems="center" gap={20}>
          <TouchableOpacity 
            onPress={handleLike}
            disabled={isLiking}
            activeOpacity={0.7}
          >
            <ThemedView 
              flexDirection="row" 
              alignItems="center" 
              gap={6}
              opacity={isLiking ? 0.6 : 1}
            >
              <Heart
                size={20}
                color={liked ? COLORS.primary : "#666"}
                variant={liked ? "Bold" : "Outline"}
              />
              <ThemedText fontSize={15}>{likeCount}</ThemedText>
            </ThemedView>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default TextPost;
