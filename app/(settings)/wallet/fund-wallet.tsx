import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import NativeButton from "@/components/ui/native-button";
import {
  Wallet1,
  CardCoin,
  ArrowLeft2,
  MoneyRecive,
  MoneySend,
} from "iconsax-react-native";
import { useGeneratePaymentLink } from "@/hooks/wallet-hooks.hooks";
import { COLORS } from "@/config/theme";
import { toast } from "@/components/lib/toast-manager";

const FundWallet = () => {
  const [amount, setAmount] = useState("");
  const [loadingFund, setLoadingFund] = useState(false);

  // Quick amount options (in dollars, starting from $5)
  const quickAmounts = [5, 10, 25, 50, 100, 250];

  // Generate the redirect URL for Flutterwave
  const getRedirectUrl = () => {
    const scheme = Linking.createURL("/payment-callback");
    return scheme;
  };

  const handleFund = async () => {
    const amt = parseInt(amount.replace(/,/g, ""), 10);
    
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amt < 5) {
      toast.error("Minimum funding amount is $5");
      return;
    }

    try {
      setLoadingFund(true);
      const redirectUrl = getRedirectUrl();
      
      const response: any = await useGeneratePaymentLink({
        data: { 
          amount: amt,
          redirect_url: redirectUrl, // Include redirect URL
        },
      });
      
      if (response?.link) {
        // Use WebBrowser.openBrowserAsync which will handle the redirect back to the app
        const result = await WebBrowser.openBrowserAsync(response.link);
        
        // Log the result for debugging
        console.log("WebBrowser result:", result);
        
        // If user dismissed the browser, show a message
        if (result.type === "dismiss") {
          toast.info("Payment cancelled");
        }
      } else {
        toast.error(response?.message || "Failed to generate payment link");
      }
    } catch (err: any) {
      console.error("Fund wallet failed:", err);
      toast.error("Unable to process funding request. Please try again.");
    } finally {
      setLoadingFund(false);
    }
  };

  const formatAmount = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, "");
    // Add comma separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(formatAmount(quickAmount.toString()));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
                fontWeight="bold"
                marginLeft={15}
                flex={1}
              >
                Fund Wallet
              </ThemedText>
            </ThemedView>

            {/* Info Card */}
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
              <ThemedView
                flexDirection="row"
                alignItems="center"
                marginBottom={15}
              >
                <ThemedView
                  width={50}
                  height={50}
                  borderRadius={25}
                  backgroundColor={COLORS.primary + "15"}
                  justifyContent="center"
                  alignItems="center"
                  marginRight={15}
                >
                  <Wallet1 size={24} color={COLORS.primary} variant="Bold" />
                </ThemedView>
                <ThemedView flex={1}>
                  <ThemedText fontSize={16} fontWeight="600">
                    Add Funds to Your Wallet
                  </ThemedText>
                  <ThemedText fontSize={12} color="#6B7280" marginTop={5}>
                    Securely fund your wallet to purchase coins and send gifts
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Amount Input Section */}
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
              <ThemedText fontSize={16} fontWeight="600" marginBottom={15}>
                Enter Amount
              </ThemedText>

              <InputField
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0"
                keyboardType="numeric"
                icon={<CardCoin color={COLORS.primary} size={24} />}
                label="Amount ($)"
              />

              {/* Quick Amount Buttons */}
              <ThemedView marginTop={20}>
                <ThemedText
                  fontSize={14}
                  color="#6B7280"
                  marginBottom={12}
                  fontWeight="500"
                >
                  Quick Amounts
                </ThemedText>
                <ThemedView
                  flexDirection="row"
                  flexWrap="wrap"
                  gap={10}
                  justifyContent="space-between"
                >
                  {quickAmounts.map((quickAmount) => (
                    <TouchableOpacity
                      key={quickAmount}
                      onPress={() => handleQuickAmount(quickAmount)}
                      style={{
                        flex: 1,
                        minWidth: "30%",
                        maxWidth: "48%",
                      }}
                    >
                      <ThemedView
                        backgroundColor={
                          amount.replace(/,/g, "") ===
                          quickAmount.toString()
                            ? COLORS.primary + "15"
                            : "#F3F4F6"
                        }
                        borderRadius={12}
                        paddingVertical={12}
                        paddingHorizontal={16}
                        borderWidth={
                          amount.replace(/,/g, "") === quickAmount.toString()
                            ? 2
                            : 0
                        }
                        borderColor={COLORS.primary}
                        alignItems="center"
                      >
                        <ThemedText
                          fontSize={14}
                          fontWeight="600"
                          color={
                            amount.replace(/,/g, "") ===
                            quickAmount.toString()
                              ? COLORS.primary
                              : "#111"
                          }
                        >
                          ${quickAmount.toLocaleString()}
                        </ThemedText>
                      </ThemedView>
                    </TouchableOpacity>
                  ))}
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Payment Info */}
            <ThemedView
              backgroundColor="#FEF3C7"
              borderRadius={16}
              padding={16}
              marginBottom={20}
              flexDirection="row"
              alignItems="flex-start"
            >
              <MoneyRecive size={20} color="#F59E0B" variant="Bold" />
              <ThemedView marginLeft={12} flex={1}>
                <ThemedText fontSize={13} fontWeight="600" color="#92400E">
                  Secure Payment
                </ThemedText>
                <ThemedText fontSize={12} color="#92400E" marginTop={4}>
                  Your payment will be processed securely through our payment
                  gateway. All transactions are encrypted and protected.
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Fund Button */}
            <TouchableOpacity
              onPress={handleFund}
              disabled={loadingFund || !amount || parseInt(amount.replace(/,/g, ""), 10) < 5}
              style={{
                backgroundColor: loadingFund || !amount || parseInt(amount.replace(/,/g, ""), 10) < 5 
                  ? COLORS.primary + "80" 
                  : COLORS.primary,
                borderRadius: 16,
                marginBottom: 20,
                paddingVertical: 16,
                justifyContent: "center",
                alignItems: "center",
                opacity: loadingFund || !amount || parseInt(amount.replace(/,/g, ""), 10) < 5 ? 0.6 : 1,
              }}
            >
              {loadingFund ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText fontSize={16} fontWeight="600" color="#fff">
                  Continue to Payment
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingVertical: 12,
                alignItems: "center",
                marginBottom: 30,
              }}
            >
              <ThemedText fontSize={14} color="#6B7280" fontWeight="500">
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FundWallet;

