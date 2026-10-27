import BackButton from "@/components/common/back-button";
import FriendCompo from "@/components/common/friend-compo";
import SearchInput from "@/components/common/search-input";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { useGetAllFriends } from "@/hooks/friend-hooks.hooks";
import { useUserStore } from "@/store/store";
import { UserProfileR } from "@/types/auth.types";
import { FilterBy } from "@/types/friend.types";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TYPOGRAPHY } from "@/config/theme";
import useTheme from "@/hooks/use-theme";

type ExploreScreenProps = {
  isTabRoot?: boolean;
};

export default function ExploreScreen({ isTabRoot = false }: ExploreScreenProps) {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const filterBy: FilterBy = { filterBy: "explore" };
  const [results, setResults] = useState<UserProfileR[]>([]);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchExplore = useCallback(async (query = "") => {
    setIsTyping(true);
    try {
      const response = await useGetAllFriends({
        filterBy,
        filterValue: query,
      });
      setResults(Array.isArray(response?.data) ? response.data : []);
    } finally {
      setIsTyping(false);
    }
  }, []);

  useEffect(() => {
    fetchExplore();
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [fetchExplore]);

  const handleTyping = (text: string) => {
    setSearchText(text);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => fetchExplore(text.trim()), 350);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <ThemedView flex={1}>
        <ThemedView style={styles.header}>
          {!isTabRoot && <BackButton />}
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Explore</ThemedText>
        </ThemedView>
        <ThemedView paddingHorizontal={12} paddingBottom={10}>
        <SearchInput
          onChangeText={handleTyping}
          placeholder="Search"
        />
        </ThemedView>

        {isTyping && (
          <ThemedView padding={24}>
            <ActivityIndicator color={theme.colors.primary} />
          </ThemedView>
        )}

        {searchText && !isTyping && results.length === 0 && (
          <View style={styles.notFoundContainer}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search-outline" size={64} color="#8e8e8e" />
            </View>
            <ThemedText weight="bold" fontSize={TYPOGRAPHY.lg} color={theme.colors.text} marginBottom={8} textAlign="center">
              No results found
            </ThemedText>
            <ThemedText fontSize={TYPOGRAPHY.sm} color={theme.colors.muted} textAlign="center">
              Try searching with different keywords
            </ThemedText>
          </View>
        )}

        {!isTyping && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FriendCompo user={item} isFriend={!!item.isFriend} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  title: {
    color: "#262626",
    fontSize: 20,
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24,
  },
  notFoundContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 64,
  },
  searchIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
});
