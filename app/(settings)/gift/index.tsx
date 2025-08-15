import React from "react";
import { Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import globalStyles from "@/components/styles/global-styles";
import { COLORS } from "@/config/theme";


const GiftWallet = () => {
  const transactions = Array.from({ length: 15 }, (_, i) => ({
    id: i.toString(),
    title: "Gift Sent",
    amount: "+₦238",
    timestamp: "Today • 11:15AM",
  }));

  return (
    <SafeAreaView style={[globalStyles.wrapper, { backgroundColor: "#F9F9FF" }]}>
      {/* Wallet Summary */}
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
          Gift Wallet Balance
        </ThemedText>
        <ThemedText
          fontSize={40}
          weight="bold"
          textAlign="center"
          color={COLORS.primary}
          marginBottom={20}
        >
          ₦{Number(4000898).toLocaleString()}
        </ThemedText>

        {/* Action Button */}
        <ThemedView justifyContent="center" alignItems="center">
          <NativeButton
            text="Fund Gift Wallet"
            mode="fill"
            style={{
              borderRadius: 100,
              paddingHorizontal: 40,
              paddingVertical: 14,
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
        Gift History
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
}: {
  title: string;
  timestamp: string;
  amount: string;
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
      <ThemedView flexDirection="row" alignItems="center" gap={12}>
        <Image
          source={require("@/assets/face.png")}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
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

      <ThemedText fontSize={15} weight="bold" color={COLORS.primary}>
        {amount}
      </ThemedText>
    </ThemedView>
  );
};

export default GiftWallet;
