import React, { useEffect, useState } from "react";
import {
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import {
  ArrowDown2,
  ArrowUp2,
  Calendar,
  Clock,
  DocumentText,
  MoneyRecive,
  MoneySend,
  TickCircle,
  CloseCircle,
} from "iconsax-react-native";
import { useFetchSingleTransaction } from "@/hooks/wallet-hooks.hooks";
import { Transaction } from "@/types/wallet.types";
import { COLORS } from "@/config/theme";
import { toast } from "@/components/lib/toast-manager";

const TransactionDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) {
        toast.error("Transaction ID is required");
        router.back();
        return;
      }

      try {
        setLoading(true);
        const response = await useFetchSingleTransaction({ id });
        
        // Handle different response structures
        if (response?.data) {
          setTransaction(response.data);
        } else if (response && !response.error) {
          // If response is the transaction object directly
          setTransaction(response as Transaction);
        } else if (response?.error) {
          toast.error(response.error || "Failed to load transaction details");
          router.back();
        } else {
          toast.error("Transaction not found");
          router.back();
        }
      } catch (err: any) {
        console.error("Failed to fetch transaction:", err);
        toast.error("Unable to load transaction details. Please try again.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
        <ThemedView
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal={20}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText marginTop={20} color="#6B7280">
            Loading transaction details...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
        <ThemedView paddingHorizontal={20} paddingTop={10}>
          <BackButton />
          <ThemedView
            flex={1}
            justifyContent="center"
            alignItems="center"
            marginTop={50}
          >
            <ThemedText fontSize={16} color="#6B7280">
              Transaction not found
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const isCredit = transaction.type === "credit";
  const statusColors: Record<typeof transaction.status, string> = {
    success: "#10B981",
    pending: "#F59E0B",
    failed: "#EF4444",
  };

  const statusIcons = {
    success: <TickCircle size={24} color="#10B981" variant="Bold" />,
    pending: <Clock size={24} color="#F59E0B" variant="Bold" />,
    failed: <CloseCircle size={24} color="#EF4444" variant="Bold" />,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    };
  };

  const { date, time } = formatDate(transaction.created_at);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView paddingHorizontal={20} paddingTop={10}>
          {/* Header */}
          <ThemedView
            flexDirection="row"
            alignItems="center"
            marginBottom={20}
          >
            <BackButton />
            <ThemedText
              fontSize={20}
              weight="bold"
              marginLeft={15}
              flex={1}
            >
              Transaction Details
            </ThemedText>
          </ThemedView>

          {/* Amount Card */}
          <ThemedView
            backgroundColor="#fff"
            borderRadius={20}
            padding={24}
            marginBottom={20}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            elevation={2}
            alignItems="center"
          >
            <ThemedView
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor={isCredit ? "#ECFDF5" : "#FEF2F2"}
              justifyContent="center"
              alignItems="center"
              marginBottom={20}
            >
              {isCredit ? (
                <ArrowDown2 size={40} color="#10B981" variant="Bold" />
              ) : (
                <ArrowUp2 size={40} color="#EF4444" variant="Bold" />
              )}
            </ThemedView>

            <ThemedText
              fontSize={36}
              weight="bold"
              color={isCredit ? "#10B981" : "#EF4444"}
              marginBottom={8}
            >
              {isCredit ? "+" : "-"}
              {Number(transaction.amount).toLocaleString()}C
            </ThemedText>

            <ThemedText fontSize={16} color="#6B7280" marginBottom={16}>
              {isCredit ? "Money In" : "Money Out"}
            </ThemedText>

            {/* Status Badge */}
            <ThemedView
              flexDirection="row"
              alignItems="center"
              backgroundColor={statusColors[transaction.status] + "20"}
              paddingHorizontal={16}
              paddingVertical={8}
              borderRadius={20}
              gap={8}
            >
              {statusIcons[transaction.status]}
              <ThemedText
                fontSize={14}
                fontWeight="600"
                color={statusColors[transaction.status]}
                textTransform="uppercase"
              >
                {transaction.status}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Transaction Information */}
          <ThemedView
            backgroundColor="#fff"
            borderRadius={20}
            padding={20}
            marginBottom={20}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            elevation={2}
          >
            <ThemedText
              fontSize={18}
              fontWeight="600"
              marginBottom={20}
              color="#111"
            >
              Transaction Information
            </ThemedText>

            {/* Transaction ID */}
            <ThemedView
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={12}
              borderBottomWidth={1}
              borderBottomColor="#F3F4F6"
            >
              <ThemedView flexDirection="row" alignItems="center" gap={12}>
                <DocumentText size={20} color="#6B7280" variant="Bold" />
                <ThemedText fontSize={14} color="#6B7280">
                  Transaction ID
                </ThemedText>
              </ThemedView>
              <ThemedText
                fontSize={14}
                fontWeight="600"
                color="#111"
                flexShrink={1}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {transaction.id.substring(0, 5)}
              </ThemedText>
            </ThemedView>

            {/* Amount */}
            <ThemedView
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={12}
              borderBottomWidth={1}
              borderBottomColor="#F3F4F6"
            >
              <ThemedView flexDirection="row" alignItems="center" gap={12}>
                {isCredit ? (
                  <MoneyRecive size={20} color="#6B7280" variant="Bold" />
                ) : (
                  <MoneySend size={20} color="#6B7280" variant="Bold" />
                )}
                <ThemedText fontSize={14} color="#6B7280">
                  Amount
                </ThemedText>
              </ThemedView>
              <ThemedText
                fontSize={14}
                fontWeight="600"
                color="#111"
              >
                {Number(transaction.amount).toLocaleString()} Coins
              </ThemedText>
            </ThemedView>

            {/* Currency */}
            <ThemedView
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={12}
              borderBottomWidth={1}
              borderBottomColor="#F3F4F6"
            >
              <ThemedView flexDirection="row" alignItems="center" gap={12}>
                <DocumentText size={20} color="#6B7280" variant="Bold" />
                <ThemedText fontSize={14} color="#6B7280">
                  Currency
                </ThemedText>
              </ThemedView>
              <ThemedText fontSize={14} fontWeight="600" color="#111">
                {transaction.currency}
              </ThemedText>
            </ThemedView>

            {/* Type */}
            <ThemedView
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={12}
            >
              <ThemedView flexDirection="row" alignItems="center" gap={12}>
                {isCredit ? (
                  <ArrowDown2 size={20} color="#6B7280" variant="Bold" />
                ) : (
                  <ArrowUp2 size={20} color="#6B7280" variant="Bold" />
                )}
                <ThemedText fontSize={14} color="#6B7280">
                  Type
                </ThemedText>
              </ThemedView>
              <ThemedText
                fontSize={14}
                fontWeight="600"
                color={isCredit ? "#10B981" : "#EF4444"}
                textTransform="capitalize"
              >
                {transaction.type}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Date & Time Information */}
          <ThemedView
            backgroundColor="#fff"
            borderRadius={20}
            padding={20}
            marginBottom={30}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            elevation={2}
          >
            <ThemedText
              fontSize={18}
              fontWeight="600"
              marginBottom={20}
              color="#111"
            >
              Date & Time
            </ThemedText>

            {/* Date */}
            <ThemedView
              flexDirection="row"
              alignItems="flex-start"
              paddingVertical={12}
              borderBottomWidth={1}
              borderBottomColor="#F3F4F6"
              gap={12}
            >
              <Calendar size={20} color="#6B7280" variant="Bold" />
              <ThemedView flex={1}>
                <ThemedText fontSize={12} color="#6B7280" marginBottom={4}>
                  Date
                </ThemedText>
                <ThemedText fontSize={14} fontWeight="600" color="#111">
                  {date}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Time */}
            <ThemedView
              flexDirection="row"
              alignItems="flex-start"
              paddingVertical={12}
              gap={12}
            >
              <Clock size={20} color="#6B7280" variant="Bold" />
              <ThemedView flex={1}>
                <ThemedText fontSize={12} color="#6B7280" marginBottom={4}>
                  Time
                </ThemedText>
                <ThemedText fontSize={14} fontWeight="600" color="#111">
                  {time}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetail;

