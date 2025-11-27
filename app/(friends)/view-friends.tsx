import {
  SafeAreaView,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import NativeButton from "@/components/ui/native-button";
import { COLORS } from "@/config/theme";
import {
  More,
  Message2,
  UserAdd,
  UserTick,
  Location,
  Calendar,
  Profile2User,
  DocumentText,
} from "iconsax-react-native";
import {
  useGetSingleFriend,
  useAddFriend,
  useUnFriend,
  useGetAllFriends,
} from "@/hooks/friend-hooks.hooks";
import { generateURL } from "@/utils/image-utils.utils";
import { UserProfileR } from "@/types/auth.types";
import { router, useLocalSearchParams } from "expo-router";
import { useUserStore } from "@/store/store";
import { useGetAllPosts } from "@/hooks/post-hooks.hooks";
import { Post } from "@/types/post.types";
import { toast } from "@/components/lib/toast-manager";
import ProfileImageGrid from "@/components/common/profile-image-grid";

const ViewFriend = () => {
  const { id: friendId } = useLocalSearchParams<{ id: string }>();
  const [friend, setFriend] = useState<UserProfileR | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isFriendLoading, setIsFriendLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const { user: currentUser } = useUserStore();

  const fetchFriend = async () => {
    if (!friendId) return;
    try {
      setLoading(true);
      const response = await useGetSingleFriend({ id: friendId });
      const friendData = response?.data || response;
      
      // Ensure friendData is an object, not a string
      if (typeof friendData === 'object' && friendData !== null) {
        setFriend(friendData);
        console.log(friendData?.id, "friendData?.id");
      } else {
        console.error("Invalid friend data received:", friendData);
        setFriend(null);
      }

      // Check if user is already a friend
      if (currentUser?.id) {
        const friendsRes = await useGetAllFriends({
          filterBy: { filterBy: "friends" },
        });
        const isAlreadyFriend = friendsRes?.data?.some(
          (f: UserProfileR) => f.id === friendId
        );
        setIsFriend(isAlreadyFriend || false);
      }
    } catch (error) {
      console.error("Error fetching friend:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!friendId) return;
    try {
      setPostsLoading(true);
      const response = await useGetAllPosts({
        data: {
          filterBy: "user",
          filterValue: friendId,
          limit: "100",
          page: "1",
        },
      });
      setPosts(response?.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriend();
    fetchUserPosts();
  }, [friendId]);

  const handleAddFriend = async () => {
    if (!friendId || isFriendLoading) return;
    try {
      setIsFriendLoading(true);
      const response = await useAddFriend({ id: friendId });
      if (response?.message === "Added to friends list") {
        setIsFriend(true);
        toast.success("Friend added successfully!");
      } else {
        toast.error(response?.message || "Failed to add friend");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Unable to add friend. Please try again.");
    } finally {
      setIsFriendLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendId || isFriendLoading) return;
    try {
      setIsFriendLoading(true);
      const response = await useUnFriend({ id: friendId });
      if (response?.message === "Removed from friends list") {
        setIsFriend(false);
        toast.success("Friend removed successfully!");
      } else {
        toast.error(response?.message || "Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Unable to remove friend. Please try again.");
    } finally {
      setIsFriendLoading(false);
    }
  };

  const handleChat = () => {
    if (!friendId) return;
    router.push(`/(chats)/chats?userId=${friendId}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFriend(), fetchUserPosts()]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ThemedView
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding={20}
        >
          <ActivityIndicator size="small" color={COLORS.primary} />
          <ThemedText marginTop={20} color="#666">
            Loading profile...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!friend) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ThemedView padding={20}>
          <BackButton />
          <ThemedView
            flex={1}
            justifyContent="center"
            alignItems="center"
            marginTop={100}
          >
            <ThemedText fontSize={18} color="#666">
              Profile not found
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser?.id === friend.id;
  const age = calculateAge(friend.date_of_birth);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ThemedView
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          padding={20}
          paddingBottom={10}
        >
          <BackButton />
          <ThemedText weight="bold" fontSize={18}>
            {friend.username}
          </ThemedText>
          <TouchableOpacity>
            <More variant="Outline" color="#000" size={24} />
          </TouchableOpacity>
        </ThemedView>

        {/* Profile Header Section */}
        <ThemedView padding={20} paddingTop={10}>
          {/* Profile Picture and Basic Info */}
          <ThemedView alignItems="center" marginBottom={20}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 3,
                borderColor: COLORS.primary,
                padding: 3,
                backgroundColor: "#fff",
              }}
            >
              <Image
                source={
                  friend?.profile_picture?.url
                    ? { uri: generateURL({ url: friend.profile_picture.url }) }
                    : require("@/assets/user.png")
                }
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 60,
                }}
                resizeMode="cover"
              />
            </View>
            <ThemedText
              weight="bold"
              fontSize={24}
              textAlign="center"
              marginTop={15}
            >
              {friend.first_name} {friend.last_name}
            </ThemedText>
            <ThemedText fontSize={16} color="#666" textAlign="center" marginTop={5}>
              @{friend.username}
            </ThemedText>
            {friend.bio && (
              <ThemedText
                fontSize={14}
                textAlign="center"
                paddingHorizontal={20}
                paddingVertical={10}
                color="#555"
                lineHeight={20}
              >
                {friend.bio}
              </ThemedText>
            )}
          </ThemedView>

          {/* Stats */}
          <ThemedView
            flexDirection="row"
            justifyContent="space-around"
            paddingVertical={20}
            borderTopWidth={1}
            borderBottomWidth={1}
            borderColor="#f0f0f0"
            marginBottom={20}
          >
            <ThemedView alignItems="center">
              <ThemedText weight="bold" fontSize={20}>
                {posts.length}
              </ThemedText>
              <ThemedText fontSize={14} color="#666" marginTop={4}>
                Posts
              </ThemedText>
            </ThemedView>
            <ThemedView alignItems="center">
              <ThemedText weight="bold" fontSize={20}>
                {friend._count?.friends || 0}
              </ThemedText>
              <ThemedText fontSize={14} color="#666" marginTop={4}>
                Friends
              </ThemedText>
            </ThemedView>
            <ThemedView alignItems="center">
              <ThemedText weight="bold" fontSize={20}>
                {friend._count?.my_friends || 0}
              </ThemedText>
              <ThemedText fontSize={14} color="#666" marginTop={4}>
                Mutual
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <ThemedView flexDirection="row" gap={10} marginBottom={20}>
              {isFriend ? (
                <NativeButton
                  mode="outline"
                  text={isFriendLoading ? "Removing..." : "Unfriend"}
                  onPress={handleRemoveFriend}
                  style={{ flex: 1, borderRadius: 12 }}
                  disabled={isFriendLoading}
                />
              ) : (
                <NativeButton
                  mode="fill"
                  text={isFriendLoading ? "Adding..." : "Add Friend"}
                  onPress={handleAddFriend}
                  style={{ flex: 1, borderRadius: 12 }}
                  disabled={isFriendLoading}
                />
              )}
              <NativeButton
                mode="outline"
                text="Message"
                onPress={handleChat}
                style={{ flex: 1, borderRadius: 12 }}
              />
            </ThemedView>
          )}

          {/* Profile Details Card */}
          <ThemedView
            backgroundColor="#f9f9f9"
            borderRadius={16}
            padding={20}
            marginBottom={20}
          >
            <ThemedText weight="bold" fontSize={18} marginBottom={15}>
              About
            </ThemedText>

            {age && (
              <ThemedView
                flexDirection="row"
                alignItems="center"
                marginBottom={12}
              >
                <Calendar size={20} color={COLORS.primary} variant="Bold" />
                <ThemedText fontSize={15} marginLeft={12} flex={1}>
                  {age} years old • {formatDate(friend.date_of_birth)}
                </ThemedText>
              </ThemedView>
            )}

            {friend.gender && (
              <ThemedView
                flexDirection="row"
                alignItems="center"
                marginBottom={12}
              >
                <Profile2User size={20} color={COLORS.primary} variant="Bold" />
                <ThemedText fontSize={15} marginLeft={12} flex={1} textTransform="capitalize">
                  {friend.gender}
                </ThemedText>
              </ThemedView>
            )}

            {friend.country && (
              <ThemedView
                flexDirection="row"
                alignItems="center"
                marginBottom={12}
              >
                <Location size={20} color={COLORS.primary} variant="Bold" />
                <ThemedText fontSize={15} marginLeft={12} flex={1}>
                  {friend.country}
                </ThemedText>
              </ThemedView>
            )}

            {friend.home_address && (
              <ThemedView
                flexDirection="row"
                alignItems="center"
                marginBottom={12}
              >
                <Location size={20} color={COLORS.primary} variant="Bold" />
                <ThemedText fontSize={15} marginLeft={12} flex={1}>
                  {friend.home_address}
                </ThemedText>
              </ThemedView>
            )}

            {friend.interests && friend.interests.length > 0 && (
              <ThemedView marginTop={8}>
                <ThemedView flexDirection="row" alignItems="center" marginBottom={10}>
                  <DocumentText size={20} color={COLORS.primary} variant="Bold" />
                  <ThemedText weight="bold" fontSize={15} marginLeft={12}>
                    Interests
                  </ThemedText>
                </ThemedView>
                <ThemedView flexDirection="row" flexWrap="wrap" gap={8}>
                  {friend.interests.map((interest) => (
                    <ThemedView
                      key={interest.id}
                      backgroundColor={COLORS.primary}
                      paddingHorizontal={12}
                      paddingVertical={6}
                      borderRadius={20}
                    >
                      <ThemedText color="#fff" fontSize={12}>
                        {interest.name}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>

          {/* Posts Section */}
          <ThemedView marginBottom={20}>
            <ThemedText weight="bold" fontSize={18} marginBottom={15}>
              Posts
            </ThemedText>
            {postsLoading ? (
              <ThemedView
                padding={40}
                justifyContent="center"
                alignItems="center"
              >
                <ActivityIndicator size="large" color={COLORS.primary} />
              </ThemedView>
            ) : posts.length > 0 ? (
              <ProfileImageGrid
                posts={posts}
                linkBase="/(home)/home"
              />
            ) : (
              <ThemedView
                padding={40}
                justifyContent="center"
                alignItems="center"
                backgroundColor="#f9f9f9"
                borderRadius={16}
              >
                <DocumentText size={48} color="#ccc" variant="Outline" />
                <ThemedText fontSize={16} color="#666" marginTop={12}>
                  No posts yet
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewFriend;

const styles = StyleSheet.create({});
