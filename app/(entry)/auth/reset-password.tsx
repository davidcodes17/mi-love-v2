import { StyleSheet } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import NativeButton from "@/components/ui/native-button";
import { Lock } from "iconsax-react-native";
import { useResetPasswordService } from "@/hooks/auth-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handelResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const otp = await AsyncStorage.getItem("otp");
      if (!token || !otp) {
        toast.error("Missing verification data. Please try again.");
        setLoading(false);
        return;
      }
      const response = await useResetPasswordService({
        data: {
          token,
          otp,
          password,
        },
      });
      if (response?.message == "Password reset successfully") {
        toast.success("Password reset successful!");
        router.push("/auth/login");
      }
      else{
        toast.error("Password reset failed!");
        router.push("/auth/login");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred. Please try again.");
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
            Reset Password
          </ThemedText>
          <ThemedText fontSize={16} color="#666" marginTop={8} lineHeight={22}>
            Enter your new password below.
          </ThemedText>
        </ThemedView>
        <ThemedView marginTop={40}>
          <InputField
            icon={<Lock size={20} color="#ddd" />}
            label="New Password"
            placeholder="Enter new password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <InputField
            icon={<Lock size={20} color="#ddd" />}
            label="Confirm Password"
            placeholder="Re-enter new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </ThemedView>
        <ThemedView
          justifyContent="flex-end"
          alignItems="center"
          marginTop={40}
          marginBottom={20}
        >
          <NativeButton
            mode="fill"
            text="Reset Password"
            style={{ borderRadius: 100, width: "100%", height: 50 }}
            onPress={handelResetPassword}
            isLoading={loading}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({});
