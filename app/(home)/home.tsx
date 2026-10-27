import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import Header from "@/layouts/header";
import Posts from "@/layouts/posts";
import { useGetProfile, useUserProfileStore } from "@/hooks/auth-hooks.hooks";
import { useUserStore } from "@/store/store";
import { registerAndSendFcmToken } from "@/utils/fcm-token.utils";
import useTheme from "@/hooks/use-theme";

export default function HomeScreen() {
  const postsRef = useRef<any>(null);
  const theme = useTheme();
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const profile = useUserProfileStore((state) => state.profile);
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await useGetProfile();

        if (data?.data) {
          setProfile(data?.data);
          setUser(data?.data);
        }
      } catch (e) {
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile || user) {
      registerAndSendFcmToken().catch((error) => {
      });
    }
  }, [profile, user]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header />
        <View style={styles.feed}>
          <Posts ref={postsRef} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  feed: {
    flex: 1,
  },
});
