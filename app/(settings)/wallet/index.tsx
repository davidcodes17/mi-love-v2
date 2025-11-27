import React, { useEffect, useState } from "react";
import {
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import {
  TransactionsResponse,
} from "@/types/wallet.types";
import {
  CardCoin,
  Refresh,
  ArrowDown2,
  ArrowUp2,
  Wallet1,
  ArrowRight2,
  EmptyWallet,
} from "iconsax-react-native";
import { useUserStore } from "@/store/store";
import { generateURL } from "@/utils/image-utils.utils";
import {
  useFetchTransactions,
  useGetWallet,
} from "@/hooks/wallet-hooks.hooks";
import BackButton from "@/components/common/back-button";

import { ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "@/config/theme";
import { LinearGradient } from "expo-linear-gradient";

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
      setLoadingWallet(false);
    } catch (err) {
      console.error("Wallet fetch failed:", err);
      setLoadingWallet(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await useFetchTransactions();
      setTransactions(response?.data ?? []);
      setLoadingTransactions(false);
    } catch (err) {
      console.error("Transactions fetch failed:", err);
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

  const balance = Number(wallet?.data?.balance ?? 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ThemedView
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={20}
          paddingTop={10}
          marginBottom={20}
        >
          <BackButton />
          <ThemedText fontSize={22} fontWeight="bold" flex={1} marginLeft={15}>
            Wallet
          </ThemedText>
          <Image
            source={
              user?.profile_picture?.url
                ? {
                    uri: generateURL({ url: user.profile_picture.url }),
                  }
                : require("@/assets/user.png")
            }
            defaultSource={require("@/assets/user.png")}
            onError={() => {}}
            style={styles.profileImage}
          />
        </ThemedView>

        {/* Balance Card */}
        <ThemedView paddingHorizontal={20} marginBottom={24}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + "DD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <ThemedView
              flexDirection="row"
              justifyContent="space-between"
              alignItems="flex-start"
              marginBottom={24}
            >
              <ThemedView flex={1}>
                <ThemedText fontSize={14} color="#FFFFFF" opacity={0.9} marginBottom={8}>
                  Your Balance
                </ThemedText>
                {loadingWallet ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText fontSize={42} color="#FFFFFF">
                    {balance.toLocaleString()}
                    <ThemedText fontSize={16} color="#FFFFFF" opacity={0.8}>
                      {" "}coins
                    </ThemedText>
                  </ThemedText>
                )}
              </ThemedView>
              <ThemedView
                width={60}
                height={60}
                borderRadius={30}
                backgroundColor="rgba(255, 255, 255, 0.2)"
                justifyContent="center"
                alignItems="center"
              >
                <Wallet1 size={32} color="#FFFFFF" variant="Bold" />
              </ThemedView>
            </ThemedView>

            {/* Action Buttons */}
            <ThemedView flexDirection="row" gap={12}>
              <TouchableOpacity
                onPress={() => router.push("/(settings)/wallet/fund-wallet")}
                style={styles.actionButton}
              >
                <CardCoin size={20} color={COLORS.primary} variant="Bold" />
                <ThemedText fontSize={14} fontWeight="600" color={COLORS.primary} marginLeft={8}>
                  Fund Wallet
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onRefresh}
                style={[styles.actionButton, styles.refreshButton]}
                disabled={refreshing || loadingWallet}
              >
                <Refresh
                  size={20}
                  color={COLORS.primary}
                  variant="Outline"
                />
              </TouchableOpacity>
            </ThemedView>
          </LinearGradient>
        </ThemedView>

        {/* Transactions Section */}
        <ThemedView paddingHorizontal={20}>
          <ThemedView
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={16}
          >
            <ThemedText fontSize={20} fontWeight="bold" color="#111">
              Recent Transactions
            </ThemedText>
            {transactions.length > 0 && (
              <TouchableOpacity>
                <ThemedText fontSize={14} color={COLORS.primary} fontWeight="500">
                  View All
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>

          {loadingTransactions ? (
            <ThemedView
              backgroundColor="#fff"
              borderRadius={20}
              padding={40}
              alignItems="center"
            >
              <ActivityIndicator size="small" color={COLORS.primary} />
              <ThemedText fontSize={14} color="#6B7280" marginTop={12}>
                Loading transactions...
              </ThemedText>
            </ThemedView>
          ) : transactions.length === 0 ? (
            <ThemedView
              backgroundColor="#fff"
              borderRadius={20}
              padding={40}
              alignItems="center"
              shadowColor="#000"
              shadowOpacity={0.05}
              shadowRadius={10}
              elevation={2}
            >
              <ThemedView
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="#F3F4F6"
                justifyContent="center"
                alignItems="center"
                marginBottom={16}
              >
                <EmptyWallet size={40} color="#9CA3AF" variant="Bold" />
              </ThemedView>
              <ThemedText fontSize={16} fontWeight="600" color="#111" marginBottom={8}>
                No transactions yet
              </ThemedText>
              <ThemedText fontSize={14} color="#6B7280" textAlign="center" marginBottom={20}>
                Your transaction history will appear here once you start using your wallet
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push("/(settings)/wallet/fund-wallet")}
                style={styles.emptyStateButton}
              >
                <ThemedText fontSize={14} fontWeight="600" color="#FFFFFF">
                  Fund Wallet
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <ThemedView
              backgroundColor="#fff"
              borderRadius={20}
              padding={16}
              shadowColor="#000"
              shadowOpacity={0.05}
              shadowRadius={10}
              elevation={2}
            >
              <FlatList
                data={transactions.slice(0, 5)} // Show only first 5
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <TransactionCard item={item} />}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <ThemedView height={12} />}
                ListFooterComponent={
                  transactions.length > 5 ? (
                    <TouchableOpacity
                      onPress={() => {
                        // Could navigate to full transactions list
                      }}
                      style={styles.viewMoreButton}
                    >
                      <ThemedText fontSize={14} color={COLORS.primary} fontWeight="500">
                        View More Transactions
                      </ThemedText>
                      <ArrowRight2 size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  ) : null
                }
              />
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

// Enhanced Transaction Card Component
const TransactionCard = ({
  item,
}: {
  item: TransactionsResponse["data"][0];
}) => {
  const isCredit = item.type === "credit";

  const statusColors: Record<typeof item.status, string> = {
    success: "#10B981",
    pending: "#F59E0B",
    failed: "#EF4444",
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push(`/(settings)/wallet/transaction-detail?id=${item.id}`)
      }
    >
      <ThemedView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        padding={16}
        borderRadius={16}
        backgroundColor="#FAFBFC"
        borderWidth={1}
        borderColor="#F3F4F6"
      >
        {/* Left side: Icon + Details */}
        <ThemedView flexDirection="row" gap={12} alignItems="center" flex={1}>
          <ThemedView
            width={48}
            height={48}
            borderRadius={14}
            justifyContent="center"
            alignItems="center"
            backgroundColor={isCredit ? "#ECFDF5" : "#FEF2F2"}
          >
            {isCredit ? (
              <ArrowDown2 size={24} color="#10B981" variant="Bold" />
            ) : (
              <ArrowUp2 size={24} color="#EF4444" variant="Bold" />
            )}
          </ThemedView>

          <ThemedView flex={1}>
            <ThemedText fontSize={15} fontWeight="600" color="#111" marginBottom={4}>
              {isCredit ? "Money In" : "Money Out"}
            </ThemedText>
            <ThemedView flexDirection="row" alignItems="center" gap={6}>
              <ThemedText fontSize={12} color="#6B7280">
                {new Date(item.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </ThemedText>
              <ThemedText fontSize={12} color="#6B7280">
                •
              </ThemedText>
              <ThemedText fontSize={12} color="#6B7280">
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Right side: Amount + Status */}
        <ThemedView alignItems="flex-end" gap={8}>
          <ThemedText
            fontSize={16}
            fontWeight="700"
            color={isCredit ? "#10B981" : "#EF4444"}
          >
            {isCredit ? "+" : "-"}
            {Number(item.amount).toLocaleString()}C
          </ThemedText>

          <ThemedView
            paddingHorizontal={10}
            paddingVertical={4}
            borderRadius={12}
            backgroundColor={statusColors[item.status] + "15"}
            minWidth={70}
            alignItems="center"
          >
            <ThemedText
              fontSize={10}
              fontWeight="600"
              color={statusColors[item.status]}
              textTransform="uppercase"
            >
              {item.status}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButton: {
    flex: 0,
    minWidth: 56,
    paddingHorizontal: 0,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
});

export default Wallet;
