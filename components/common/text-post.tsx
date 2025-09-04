import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { Heart, More, MessageCircle, Share } from "iconsax-react-native";
import { PostProps } from "@/types/post.types";
import { generateURL } from "@/utils/image-utils.utils";
import {
  useLikePost,
  useUnlikePost,
  useGetAllLikes,
} from "@/hooks/post-hooks.hooks";
import { useUserProfileStore } from "@/hooks/auth-hooks.hooks";

const TextPost: React.FC<PostProps> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?._count?.likes || 0);
  const [profileImageLoading, setProfileImageLoading] = useState(true);
  const profile = useUserProfileStore((state) => state.profile);

  const shortText =
    post?.content.length > 150
      ? post?.content.slice(0, 150) + "..."
      : post?.content;

  const handleLike = async () => {
    if (liked) {
      setLikeCount((c) => c - 1);
      await useUnlikePost({ id: post.id });
      setLiked(false);
    } else {
      setLikeCount((c) => c + 1);
      await useLikePost({ id: post.id });
      setLiked(true);
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
              />
            ) : (
              <ThemedText fontSize={20} weight="bold" color={COLORS.primary}>
                {post?.user?.first_name?.[0]}
                {post?.user?.last_name?.[0]}
              </ThemedText>
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
          <TouchableOpacity onPress={handleLike}>
            <ThemedView flexDirection="row" alignItems="center" gap={6}>
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
