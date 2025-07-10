import { FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useEffect } from "react";

import { toast } from "@/components/lib/toast-manager";
import globalStyles from "@/components/styles/global-styles";
import Header from "@/layouts/header";
import ThemedView from "@/components/ui/themed-view";
import StatusSide from "@/layouts/status-section";
import Interests from "@/layouts/interests";
import Posts from "@/layouts/posts";
import React, { useState, useCallback, useRef } from "react";
import { router } from "expo-router";
import { useGetProfile, useUserProfileStore } from "@/hooks/auth-hooks.hooks";

export default function HomeScreen() {
  const components = ["header", "status", "interests", "posts"];
  const [refreshing, setRefreshing] = useState(false);
  const postsRef = useRef<any>(null);
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const profile = useUserProfileStore((state) => state.profile);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profile) {
        try {
          const data = await useGetProfile();
          if (data) setProfile(data);
        } catch (e) {
          // Optionally handle error
        }
      }
    };
    fetchProfile();
  }, [profile, setProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // If Posts exposes a refresh method, call it
    router.push("/home")
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
      case "status":
        Component = StatusSide;
        break;
      case "interests":
        Component = Interests;
        break;
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
