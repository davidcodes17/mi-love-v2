import React from "react";
import { Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import globalStyles from "@/components/styles/global-styles";
import { COLORS } from "@/config/theme";

const Wallet = () => {
  const transactions = Array.from({ length: 10 }, (_, i) => ({
    id: i.toString(),
    title: i % 2 === 0 ? "Luxury Gifts" : "Food Order",
    amount: i % 2 === 0 ? "+₦3,000" : "-₦1,200",
    isCredit: i % 2 === 0,
    timestamp: "Today • 12:30PM",
  }));

  return (
    <SafeAreaView style={[globalStyles.wrapper, { backgroundColor: "#F9F9FF" }]}>
      {/* Wallet Balance */}
      <ThemedView
        paddingHorizontal={24}
        paddingTop={32}
        paddingBottom={24}
        backgroundColor="#fff"
        borderRadius={24}
        marginHorizontal={20}
        marginTop={20}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.05}
        shadowRadius={10}
        elevation={5}
      >
        <ThemedText
          fontSize={16}
          color="#666"
          textAlign="center"
          marginBottom={6}
        >
          Wallet Balance
        </ThemedText>
        <ThemedText
          fontSize={40}
          weight="bold"
          textAlign="center"
          color={COLORS.primary}
          marginBottom={20}
        >
          ₦4,000,898
        </ThemedText>

        {/* Actions */}
        <ThemedView
          flexDirection="row"
          justifyContent="center"
          gap={12}
        >
          <NativeButton
            text="Fund"
            mode="outline"
            style={{
              borderRadius: 100,
              paddingHorizontal: 30,
              paddingVertical: 12,
            }}
          />
          <NativeButton
            text="Fund Gift Wallet"
            mode="outline"
            style={{
              borderRadius: 100,
              borderColor: COLORS.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          />
        </ThemedView>
      </ThemedView>

      {/* Recent Transactions */}
      <ThemedText
        fontSize={18}
        weight="bold"
        marginTop={30}
        marginBottom={10}
        marginHorizontal={20}
      >
        Recent Activity
      </ThemedText>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TransactionCard
            title={item.title}
            timestamp={item.timestamp}
            amount={item.amount}
            isCredit={item.isCredit}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const TransactionCard = ({
  title,
  timestamp,
  amount,
  isCredit,
}: {
  title: string;
  timestamp: string;
  amount: string;
  isCredit: boolean;
}) => {
  return (
    <ThemedView
      backgroundColor="#fff"
      padding={16}
      borderRadius={20}
      marginBottom={14}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.03}
      shadowRadius={5}
      elevation={3}
    >
      <ThemedView flexDirection="row" alignItems="center" gap={14}>
        <Image
          source={require("@/assets/face.png")}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
          }}
        />
        <ThemedView>
          <ThemedText fontSize={16} weight="medium">
            {title}
          </ThemedText>
          <ThemedText fontSize={12} color="#999">
            {timestamp}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedText
        fontSize={15}
        weight="bold"
        color={isCredit ? "#00C851" : "#FF4444"}
      >
        {amount}
      </ThemedText>
    </ThemedView>
  );
};

export default Wallet;
