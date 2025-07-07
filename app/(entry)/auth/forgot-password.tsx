import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { Sms } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import { useRouter } from "expo-router";

const ForgotPassword = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView padding={20} flex={1}>
        <BackButton />

        <ThemedView marginTop={20}>
          <ThemedText fontSize={30} weight="semibold">
            Forgot Password
          </ThemedText>
          <ThemedText 
            fontSize={16} 
            color="#666" 
            marginTop={8}
            lineHeight={22}
          >
            Enter an email address and we'll send you a verification code
          </ThemedText>
        </ThemedView>

        <ThemedView marginTop={40} flex={1}>
          <InputField
            icon={<Sms size={20} color="#ddd" />}
            label="Email Address"
            placeholder="you@gmail.com"
            keyboardType="email-address"
          />

          <ThemedView 
            justifyContent="flex-end" 
            alignItems="center"
            marginTop={40}
            marginBottom={20}
          >
            <NativeButton
              mode="fill"
              text="Send Reset Link"
              style={{
                borderRadius: 100,
                width: "100%",
                height: 50,
              }}
              onPress={() => router.push("/auth/verify-otp")}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({});
