import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import NativeButton from "@/components/ui/native-button";
import AppleOTPInput from "@/components/common/apple-otp-input";
import { useRouter } from "expo-router";
import { toast } from "@/components/lib/toast-manager";
import { useVerifyOtp } from "@/hooks/auth-hooks.hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_STORAGE_KEYS } from "@/services/auth-service.service";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "@/hooks/use-theme";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleVerify = async () => {
    if (!otp || otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      // You may want to get the email from navigation params or storage
      const email = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.resetEmail);
      if (!email) {
        toast.error("No email found. Please go back and enter your email.");
        setLoading(false);
        return;
      }
      const response = await useVerifyOtp({
        email,
        otp,
        type: "reset",
      });
      const resetToken = response?.token || response?.reset_token;
      if (resetToken) {
        toast.success("OTP Verified!");
        await AsyncStorage.multiSet([
          [AUTH_STORAGE_KEYS.resetToken, resetToken],
          [AUTH_STORAGE_KEYS.resetOtp, otp],
        ]);
        router.push("/auth/reset-password");
      } else {
        toast.error(response?.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error(error?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView padding={24} flex={1}>
        <BackButton />
        <ThemedView marginTop={34}>
          <View style={[styles.iconBadge, { backgroundColor: theme.colors.soft }]}>
            <Ionicons name="shield-checkmark-outline" size={25} color={theme.colors.primary} />
          </View>
          <ThemedText fontSize={29} weight="bold">
            Verify OTP
          </ThemedText>
          <ThemedText fontSize={14} color={theme.colors.muted} marginTop={8} lineHeight={22}>
            Enter the 6-digit code sent to your email address
          </ThemedText>
        </ThemedView>
        <ThemedView marginTop={40} alignItems="center">
          <AppleOTPInput value={otp} onChange={setOtp} maxLength={6} />
        </ThemedView>
        <ThemedView
          justifyContent="flex-end"
          alignItems="center"
          marginTop={40}
          marginBottom={20}
        >
          <NativeButton
            mode="fill"
            text="Verify"
            style={{ borderRadius: 100, width: "100%" }}
            onPress={handleVerify}
            isLoading={loading}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default VerifyOtp;

const styles = StyleSheet.create({
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
});
