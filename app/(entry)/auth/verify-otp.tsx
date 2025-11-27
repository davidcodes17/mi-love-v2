import { StyleSheet } from "react-native";
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

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (!otp || otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      // You may want to get the email from navigation params or storage
      const email = await AsyncStorage.getItem("email");
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
      if (response?.token) {
        toast.success("OTP Verified!");
        await AsyncStorage.setItem("token", response.token);
        await AsyncStorage.setItem("otp", otp);
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
      <ThemedView padding={20} flex={1}>
        <BackButton />
        <ThemedView marginTop={20}>
          <ThemedText fontSize={30} weight="semibold">
            Verify OTP
          </ThemedText>
          <ThemedText fontSize={16} color="#666" marginTop={8} lineHeight={22}>
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

const styles = StyleSheet.create({});
