import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import { COLORS } from "@/config/theme";
import { fetchSingleTransaction } from "@/services/wallet-service.service";
import { Check, CloseCircle } from "iconsax-react-native";

interface TransactionData {
  id: string;
  type: string;
  status: "completed" | "failed" | "pending";
  amount: number;
  currency: string;
  created_at: string;
  payment_reference?: string;
  error_message?: string;
}

export default function PaymentCallback() {
  const { status, transaction_id, reference } = useLocalSearchParams<{
    status?: string;
    transaction_id?: string;
    reference?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | "pending">("pending");

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);

        // Determine if payment was successful
        const isSuccess = status === "successful" || status === "completed";

        if (isSuccess && transaction_id) {
          // Fetch transaction details from backend
          const response = await fetchSingleTransaction({ id: transaction_id });

          if (response?.data) {
            setTransaction(response.data);
            setPaymentStatus("success");
          } else if (response?.error) {
            setError(response.error);
            setPaymentStatus("failed");
          } else {
            setPaymentStatus("success");
            setTransaction({
              id: transaction_id,
              type: "wallet_funding",
              status: "completed",
              amount: 0,
              currency: "USD",
              created_at: new Date().toISOString(),
              payment_reference: reference,
            });
          }
        } else {
          setPaymentStatus("failed");
          setError("Payment was cancelled or failed. Please try again.");
        }
      } catch (err: any) {
        console.error("Payment callback error:", err);
        setPaymentStatus("failed");
        setError(err?.message || "Failed to process payment callback");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [status, transaction_id, reference]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText fontSize={16} marginTop={20}>
            Processing payment...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <View style={styles.container}>
        {/* Status Card */}
        <ThemedView
          borderRadius={16}
          padding={30}
          alignItems="center"
          justifyContent="center"
          backgroundColor={paymentStatus === "success" ? "#e7f5e5" : "#ffe7e7"}
        >
          {paymentStatus === "success" ? (
            <>
              <Check size={60} color="#34c759" variant="Bold" />
              <ThemedText
                fontSize={22}
                fontWeight="bold"
                marginTop={16}
                color="#34c759"
              >
                Payment Successful
              </ThemedText>
              <ThemedText
                fontSize={14}
                color="#34c759"
                marginTop={8}
                textAlign="center"
              >
                Your wallet has been funded successfully
              </ThemedText>
            </>
          ) : (
            <>
              <CloseCircle size={60} color="#ff3b30" variant="Bold" />
              <ThemedText
                fontSize={22}
                fontWeight="bold"
                marginTop={16}
                color="#ff3b30"
              >
                Payment Failed
              </ThemedText>
              <ThemedText
                fontSize={14}
                color="#ff3b30"
                marginTop={8}
                textAlign="center"
              >
                {error || "Unable to complete payment"}
              </ThemedText>
            </>
          )}
        </ThemedView>

        {/* Transaction Details */}
        {transaction && paymentStatus === "success" && (
          <ThemedView
            backgroundColor="#fff"
            borderRadius={16}
            padding={20}
            marginVertical={20}
          >
            <ThemedText fontSize={16} fontWeight="600" marginBottom={16}>
              Transaction Details
            </ThemedText>

            <ThemedView
              flexDirection="row"
              justifyContent="space-between"
              marginBottom={12}
              paddingBottom={12}
              borderBottomWidth={1}
              borderBottomColor="#f0f0f0"
            >
              <ThemedText fontSize={14} color="#666">
                Amount
              </ThemedText>
              <ThemedText fontSize={14} fontWeight="600">
                ${transaction.amount?.toFixed(2) || "0.00"} {transaction.currency}
              </ThemedText>
            </ThemedView>

            <ThemedView
              flexDirection="row"
              justifyContent="space-between"
              marginBottom={12}
              paddingBottom={12}
              borderBottomWidth={1}
              borderBottomColor="#f0f0f0"
            >
              <ThemedText fontSize={14} color="#666">
                Reference
              </ThemedText>
              <ThemedText fontSize={14} fontWeight="600">
                {transaction.payment_reference || transaction.id}
              </ThemedText>
            </ThemedView>

            <ThemedView flexDirection="row" justifyContent="space-between">
              <ThemedText fontSize={14} color="#666">
                Date
              </ThemedText>
              <ThemedText fontSize={14} fontWeight="600">
                {new Date(transaction.created_at).toLocaleDateString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <NativeButton
          text={paymentStatus === "success" ? "View Transactions" : "Try Again"}
          onPress={() => {
            if (paymentStatus === "success") {
              // Navigate to transactions page
              router.push("/(settings)/wallet");
            } else {
              // Go back to fund wallet
              router.back();
            }
          }}
          mode="fill"
          style={{ backgroundColor: COLORS.primary }}
        />

          <NativeButton
            text="Back to Wallet"
            onPress={() => {
              router.replace("/(settings)/wallet");
            }}
            mode="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 30,
  },
});
