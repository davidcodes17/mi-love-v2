import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import {
  PaymentLinkResponse,
  TransactionsResponse,
  WalletResponse,
} from "@/types/wallet.types";
import BottomSheet from "@gorhom/bottom-sheet";
import * as WebBrowser from "expo-web-browser";
import {
  CardCoin,
  Refresh,
  ArrowDown2,
  ArrowUp2,
  Wallet1,
} from "iconsax-react-native";
import { useUserStore } from "@/store/store";
import { generateURL } from "@/utils/image-utils.utils";
import {
  useFetchTransactions,
  useGeneratePaymentLink,
  useGetWallet,
} from "@/hooks/wallet-hooks.hooks";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import NativeButton from "@/components/ui/native-button";

import { ActivityIndicator } from "react-native";
import { COLORS } from "@/config/theme";

const Wallet = () => {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fundModalVisible, setFundModalVisible] = useState(false);

  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingFund, setLoadingFund] = useState(false);

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

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const handleFund = async () => {
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) return;

    try {
      setLoadingFund(true);
      const response: any = await useGeneratePaymentLink({
        data: { amount: amt },
      });
      setLoadingFund(false);
      if (response?.link) {
        await WebBrowser.openBrowserAsync(response.link);
        setFundModalVisible(false);
        setAmount("");
      }
    } catch (err) {
      setLoadingFund(false);
      console.error("Fund wallet failed:", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView paddingHorizontal={20}>
        {/* Header */}
        <ThemedView
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginVertical={10}
        >
          <BackButton />
          <Image
            source={{
              uri: generateURL({ url: user?.profile_picture?.url || "" }),
            }}
            style={{ width: 45, height: 45, borderRadius: 100 }}
          />
        </ThemedView>

        {/* Balance Section */}
        <ThemedView paddingTop={20}>
          <ThemedText>Your Balance</ThemedText>
          {loadingWallet ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ marginVertical: 20 }}
            />
          ) : (
            <ThemedView
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <ThemedText fontSize={50}>
                {Number(wallet?.data?.balance ?? 0).toLocaleString()}{" "}
                <ThemedText fontSize={12}>coins</ThemedText>
              </ThemedText>

              <ThemedView flexDirection="row" gap={10}>
                <TouchableOpacity
                  onPress={() => {
                    fetchWalletData();
                    fetchTransactions();
                  }}
                >
                  <ThemedView flexDirection="row" justifyContent="center">
                    <Refresh color="#000" size={25} />
                  </ThemedView>
                  <ThemedText fontSize={12} paddingTop={10}>
                    Refresh
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFundModalVisible(true)}>
                  <TextAndIcon
                    icon={<CardCoin color="#000" size={25} />}
                    text="Fund Wallet"
                  />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      {/* Transactions */}
      <ThemedView paddingHorizontal={20} marginTop={20} flex={1}>
        <ThemedText fontSize={16} marginBottom={10} fontWeight="bold">
          Recent Transactions
        </ThemedText>

        {loadingTransactions ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransactionCard item={item} />}
            style={{ backgroundColor: "#fff", borderRadius: 20 }}
            ListEmptyComponent={
              <ThemedText fontSize={12} color="gray">
                No transactions yet
              </ThemedText>
            }
          />
        )}
      </ThemedView>

      {/* Fund Wallet Modal */}
      <Modal
        visible={fundModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFundModalVisible(false)}
      >
        <ThemedView
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor="rgba(0,0,0,0.4)"
        >
          <ThemedView
            backgroundColor="#fff"
            padding={20}
            borderRadius={20}
            width="80%"
          >
            <InputField
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              icon={<Wallet1 color="#ddd" size={20} />}
              label="Enter Amount"
            />
            <NativeButton
              mode="fill"
              text="Fund Wallet"
              style={{ borderRadius: 20, marginTop: 10 }}
              onPress={handleFund}
              isLoading={loadingFund}
            />
            <Pressable
              onPress={() => setFundModalVisible(false)}
              style={{ marginTop: 10, alignItems: "center" }}
            >
              <ThemedText fontSize={14} color="#EF4444">
                Cancel
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
    </SafeAreaView>
  );
};

// TransactionCard & TextAndIcon remain same as your previous version

// ✅ Transaction Card Component
// ✅ Transaction Card Component - GenZ Modern
const TransactionCard = ({
  item,
}: {
  item: TransactionsResponse["data"][0];
}) => {
  const isCredit = item.type === "credit";

  // status badge colors
  const statusColors: Record<typeof item.status, string> = {
    success: "#10B981", // emerald green
    pending: "#F59E0B", // amber
    failed: "#EF4444", // coral red
  };

  // currency symbol mapping
  const currencySymbol = (cur: string) => {
    switch (cur) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return cur + " ";
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85}>
      <ThemedView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        padding={16}
        marginBottom={14}
        borderRadius={18}
        backgroundColor="#fff"
        shadowColor="#000"
        shadowOpacity={0.07}
        shadowRadius={6}
        elevation={3}
      >
        {/* Left side: Icon in a chip + Details */}
        <ThemedView flexDirection="row" gap={14} alignItems="center">
          <ThemedView
            width={42}
            height={42}
            borderRadius={12}
            justifyContent="center"
            alignItems="center"
            backgroundColor={isCredit ? "#ECFDF5" : "#FEF2F2"}
          >
            {isCredit ? (
              <ArrowDown2 size={22} color="#10B981" />
            ) : (
              <ArrowUp2 size={22} color="#EF4444" />
            )}
          </ThemedView>

          <ThemedView>
            <ThemedText fontSize={15} fontWeight="600" color="#111">
              {isCredit ? "Money In" : "Money Out"}
            </ThemedText>
            <ThemedText fontSize={12} color="#6B7280">
              {new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              •{" "}
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Right side: Amount + Status pill */}
        <ThemedView alignItems="flex-end" gap={6} flexShrink={0}>
          <ThemedText
            fontSize={16}
            fontWeight="700"
            color={isCredit ? "#10B981" : "#EF4444"}
          >
            {isCredit ? "+" : "-"}
            {/* {currencySymbol(item.currency)} */}
            {Number(item.amount).toLocaleString()}C
          </ThemedText>

          <ThemedView
            paddingHorizontal={10}
            paddingVertical={5}
            minWidth={80} // wider to fit uppercase text
            borderRadius={20}
            backgroundColor={statusColors[item.status] + "20"} // faded bg
            justifyContent="center"
            alignItems="center"
            flexShrink={0} // prevent squeezing
          >
            <ThemedText
              fontSize={11}
              fontWeight="600"
              color={statusColors[item.status]}
              textTransform="uppercase" // fully uppercase
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.status}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

const TextAndIcon = ({ text, icon }: { text: string; icon: any }) => (
  <ThemedView justifyContent="center" alignItems="center">
    {icon}
    <ThemedText paddingTop={10} fontSize={12}>
      {text}
    </ThemedText>
  </ThemedView>
);

export default Wallet;
