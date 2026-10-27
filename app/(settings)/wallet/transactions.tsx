import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowDown2, ArrowUp2 } from "iconsax-react-native";
import BackButton from "@/components/common/back-button";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { useFetchTransactions } from "@/hooks/wallet-hooks.hooks";
import { Transaction } from "@/types/wallet.types";

const PAGE_SIZE = 20;

export default function WalletTransactions() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (nextPage: number, replace = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await useFetchTransactions({
        page: nextPage,
        limit: PAGE_SIZE,
      });
      const nextItems: Transaction[] = Array.isArray(response?.data)
        ? response.data
        : [];
      setItems((current) => {
        const combined = replace ? nextItems : [...current, ...nextItems];
        return Array.from(
          new Map(combined.map((transaction) => [transaction.id, transaction])).values()
        );
      });
      const totalPages = Number(response?.meta?.totalPages ?? nextPage);
      setHasMore(nextPage < totalPages || nextItems.length === PAGE_SIZE);
      setPage(nextPage);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);

  const refresh = () => {
    setRefreshing(true);
    setHasMore(true);
    loadPage(1, true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton />
        <ThemedText fontSize={20} fontWeight="700" marginLeft={14}>
          Transaction History
        </ThemedText>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        onEndReached={() => {
          if (hasMore && !loadingRef.current) loadPage(page + 1);
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !loading ? (
            <ThemedView alignItems="center" paddingTop={80}>
              <ThemedText color="#6B7280">No transactions yet.</ThemedText>
            </ThemedView>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null
        }
        renderItem={({ item }) => {
          const credit = item.type === "credit";
          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(settings)/wallet/transaction-detail",
                  params: { id: item.id },
                })
              }
              style={styles.row}
            >
              <View style={[styles.icon, { backgroundColor: credit ? "#ECFDF5" : "#FEF2F2" }]}>
                {credit ? (
                  <ArrowDown2 color="#10B981" size={22} />
                ) : (
                  <ArrowUp2 color="#EF4444" size={22} />
                )}
              </View>
              <View style={styles.details}>
                <ThemedText fontSize={15} fontWeight="600">
                  {credit ? "Money In" : "Money Out"}
                </ThemedText>
                <ThemedText fontSize={12} color="#6B7280">
                  {new Date(item.created_at).toLocaleString()}
                </ThemedText>
              </View>
              <ThemedText fontSize={15} fontWeight="700" color={credit ? "#10B981" : "#EF4444"}>
                {credit ? "+" : "-"}{Number(item.amount).toLocaleString()}C
              </ThemedText>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FA" },
  header: { flexDirection: "row", alignItems: "center", padding: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  details: { flex: 1, gap: 4, marginHorizontal: 12 },
  loader: { marginVertical: 18 },
});
