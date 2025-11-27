import { FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useEffect } from "react";
import globalStyles from "@/components/styles/global-styles";
import Header from "@/layouts/header";
import ThemedView from "@/components/ui/themed-view";
import StatusSide from "@/layouts/status-section";
import Interests from "@/layouts/interests";
import Posts from "@/layouts/posts";
import React, { useState, useCallback, useRef } from "react";
import { router } from "expo-router";
import { useGetProfile, useUserProfileStore } from "@/hooks/auth-hooks.hooks";
import { useUserStore } from "@/store/store";
import { registerAndSendFcmToken } from "@/utils/fcm-token.utils";

export default function HomeScreen() {
  const components = ["header", "status", "interests", "posts"];
  const [refreshing, setRefreshing] = useState(false);
  const postsRef = useRef<any>(null);
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const profile = useUserProfileStore((state) => state.profile);
  const { user, updateUser, setUser } = useUserStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await useGetProfile(); // make sure this is an API call function
        console.log("Fetched profile:", data?.data);

        if (data?.data) {
          setProfile(data?.data); // Zustand store
          setUser(data?.data); // Another store
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
      }
    };

    fetchProfile();
  }, []); // run once on mount

  // Register and send FCM token when user is authenticated
  useEffect(() => {
    if (profile || user) {
      // User is authenticated, ensure FCM token is registered and sent
      registerAndSendFcmToken().catch((error) => {
        console.error("Failed to register/send FCM token:", error);
      });
    }
  }, [profile, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await postsRef.current?.refresh();
    } catch (e) {
      console.error("Failed to refresh posts:", e);
    }

    setRefreshing(false);
  }, []);
  const renderComponent = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    let Component;
    let props = {};
    switch (item) {
      case "header":
        Component = Header;
        break;
        // case "status":
        //   Component = StatusSide;
        break;
      // case "interests":
      //   Component = Interests;
      //   break;
      case "posts":
        Component = Posts;
        props = { ref: postsRef };
        break;
      default:
        return null;
    }

    return (
      <Animated.View entering={FadeInUp.delay(index * 100)}>
        <Component {...props} />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView paddingHorizontal={20} flex={1}>
        <FlatList
          data={components}
          keyExtractor={(item) => item}
          renderItem={renderComponent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}
