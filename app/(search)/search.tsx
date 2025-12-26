import BackButton from "@/components/common/back-button";
import FriendCompo from "@/components/common/friend-compo";
import SearchInput from "@/components/common/search-input";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { useGetAllFriends } from "@/hooks/friend-hooks.hooks";
import { useUserStore } from "@/store/store";
import { UserProfileR } from "@/types/auth.types";
import { FilterBy } from "@/types/friend.types";
import { useState, useRef } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY } from "@/config/theme";

export default function Page() {
  const [searchText, setSearchText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [filterBy, setFilterBy] = useState<FilterBy>({ filterBy: "explore" });
  const [results, setResults] = useState<UserProfileR[]>([]);
  const typingTimeout: any = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (text: string) => {
    setSearchText(text);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    if (!text.trim()) {
      setResults([]); // reset when input cleared
      return;
    }

    setIsTyping(true);

    typingTimeout.current = setTimeout(async () => {
      try {
        const response = await useGetAllFriends({
          filterBy,
          filterValue: searchText,
        });
        setResults(response?.data || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsTyping(false);
      }
    }, 600);
  };

  const { user: profile } = useUserStore();

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView padding={20}>
        <ThemedView paddingBottom={20}>
          <BackButton />
        </ThemedView>
        <SearchInput
          onChangeText={handleTyping}
          placeholder="Search users..."
        />

        {isTyping && (
          <ThemedView padding={20}>
            <ActivityIndicator />
          </ThemedView>
        )}

        {!searchText && !isTyping && (
          <ThemedView padding={20}>
            <ThemedText>Start typing to search for users...</ThemedText>
          </ThemedView>
        )}

        {searchText && !isTyping && results.length === 0 && (
          <View style={styles.notFoundContainer}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search-outline" size={80} color="#ccc" />
            </View>
            <ThemedText weight="bold" fontSize={TYPOGRAPHY.title} color="#333" marginBottom={8} textAlign="center">
              No results found
            </ThemedText>
            <ThemedText fontSize={TYPOGRAPHY.md} color="#666" textAlign="center" lineHeight={22} paddingHorizontal={20}>
              Try searching with different keywords
            </ThemedText>
          </View>
        )}

        <ScrollView style={{ paddingTop: 20 }}>
          {results.map((user) => (
            <FriendCompo key={user.id} user={user} isFriend={false} />
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  notFoundContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
    marginTop: 40,
  },
  searchIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
});
