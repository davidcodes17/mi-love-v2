import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import BackButton from "@/components/common/back-button";
import { ThemedText } from "@/components/ui/themed-view";
import {
  useFetchTransactions,
  useGetWallet,
} from "@/hooks/wallet-hooks.hooks";
import { useUserStore } from "@/store/store";
import { generateURL } from "@/utils/image-utils.utils";
import { TransactionsResponse } from "@/types/wallet.types";

const Wallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { user } = useUserStore();

  const fetchWalletData = async () => {
    try {
      setLoadingWallet(true);
      const response = await useGetWallet();
      setWallet(response);
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await useFetchTransactions();
      setTransactions(response?.data ?? []);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWalletData(), fetchTransactions()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const balance = Number(wallet?.balance ?? wallet?.data?.balance ?? 0);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.closeBtn}
        >
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <ThemedText style={styles.closeLabel}>Settings</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRefresh} hitSlop={10} disabled={refreshing}>
          <Ionicons name="ellipsis-horizontal-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8E8E93"
          />
        }
      >
        <ThemedText style={styles.screenTitle}>Wallet</ThemedText>

        {/* Apple Cash–style card */}
        <View style={styles.cardShadow}>
          <LinearGradient
            colors={["#2C2C2E", "#1C1C1E", "#000000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cashCard}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.cardBrand}>
                <View style={styles.appleMark}>
                  <Ionicons name="logo-apple" size={16} color="#fff" />
                </View>
                <ThemedText style={styles.cardBrandText}>Mi Love Cash</ThemedText>
              </View>
              <Image
                source={
                  user?.profile_picture?.url
                    ? { uri: generateURL({ url: user.profile_picture.url }) }
                    : require("@/assets/user.png")
                }
                style={styles.cardAvatar}
              />
            </View>

            <ThemedText style={styles.availableLabel}>Available Balance</ThemedText>
            {loadingWallet ? (
              <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
            ) : (
              <ThemedText style={styles.balance}>
                {balance.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                <ThemedText style={styles.balanceUnit}> coins</ThemedText>
              </ThemedText>
            )}

            <View style={styles.cardFooter}>
              <ThemedText style={styles.cardFooterText}>
                {user?.username ? `@${user.username}` : "Mi Love Wallet"}
              </ThemedText>
              <Ionicons name="wifi" size={18} color="rgba(255,255,255,0.55)" />
            </View>
          </LinearGradient>
        </View>

        {/* Circular Apple Cash actions */}
        <View style={styles.actions}>
          <ActionCircle
            icon="add"
            label="Add Money"
            onPress={() => router.push("/(settings)/wallet/fund-wallet")}
          />
          <ActionCircle
            icon="gift-outline"
            label="Gifts"
            onPress={() => router.push("/(settings)/wallet/gift-shop")}
          />
          <ActionCircle
            icon="list-outline"
            label="Activity"
            onPress={() => router.push("/(settings)/wallet/transactions")}
          />
        </View>

        {/* Latest Transactions */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Latest Transactions</ThemedText>
          {transactions.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/(settings)/wallet/transactions")}
            >
              <ThemedText style={styles.seeAll}>See All</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.activityCard}>
          {loadingTransactions ? (
            <View style={styles.emptyPad}>
              <ActivityIndicator color="#8E8E93" />
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyPad}>
              <View style={styles.emptyIcon}>
                <Ionicons name="wallet-outline" size={28} color="#8E8E93" />
              </View>
              <ThemedText style={styles.emptyTitle}>No Activity</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Transactions will appear here after you add money or send gifts.
              </ThemedText>
              <TouchableOpacity
                style={styles.emptyCta}
                onPress={() => router.push("/(settings)/wallet/fund-wallet")}
              >
                <ThemedText style={styles.emptyCtaText}>Add Money</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={transactions.slice(0, 6)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <TransactionRow
                  item={item}
                  isLast={index === Math.min(transactions.length, 6) - 1}
                />
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ActionCircle = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.actionCircle}>
      <Ionicons name={icon} size={26} color="#007AFF" />
    </View>
    <ThemedText style={styles.actionLabel}>{label}</ThemedText>
  </TouchableOpacity>
);

const TransactionRow = ({
  item,
  isLast,
}: {
  item: TransactionsResponse["data"][0];
  isLast?: boolean;
}) => {
  const isCredit = item.type === "credit";
  const date = new Date(item.created_at);

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={() =>
        router.push(`/(settings)/wallet/transaction-detail?id=${item.id}`)
      }
      style={[styles.row, !isLast && styles.rowBorder]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: isCredit ? "#34C759" : "#FF3B30" },
        ]}
      >
        <Ionicons
          name={isCredit ? "arrow-down" : "arrow-up"}
          size={18}
          color="#fff"
        />
      </View>
      <View style={styles.rowBody}>
        <ThemedText style={styles.rowTitle} numberOfLines={1}>
          {isCredit ? "Money Added" : "Payment"}
        </ThemedText>
        <ThemedText style={styles.rowSubtitle}>
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          {" · "}
          {item.status === "success"
            ? "Completed"
            : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </ThemedText>
      </View>
      <ThemedText
        style={[
          styles.rowAmount,
          isCredit ? styles.amountCredit : styles.amountDebit,
        ]}
      >
        {isCredit ? "+" : "−"}
        {Number(item.amount).toLocaleString()}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 4,
    minHeight: 44,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeLabel: {
    color: "#007AFF",
    fontSize: 17,
    marginLeft: -2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.37,
    marginTop: 4,
    marginBottom: 18,
  },
  cardShadow: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
  cashCard: {
    borderRadius: 16,
    padding: 22,
    minHeight: 200,
    overflow: "hidden",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  cardBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appleMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBrandText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  cardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  availableLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  balance: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  balanceUnit: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 18,
    fontWeight: "500",
  },
  cardFooter: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardFooterText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginTop: 22,
    marginBottom: 28,
  },
  actionItem: {
    alignItems: "center",
    width: 84,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  seeAll: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "400",
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyPad: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyCta: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyCtaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
    marginLeft: 68,
    paddingLeft: 0,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowBody: {
    flex: 1,
    paddingRight: 8,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: "400",
    color: "#000",
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  rowAmount: {
    fontSize: 17,
    fontWeight: "400",
  },
  amountCredit: {
    color: "#34C759",
  },
  amountDebit: {
    color: "#000",
  },
});
