import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { Sms } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import { useRouter } from "expo-router";
import { useSendOtp } from "@/hooks/auth-hooks.hooks";
import toast from "@originaltimi/rn-toast";
import { useFormik } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formik = useFormik({
    initialValues: { email: "" },
    validate: (values) => {
      const errors: { email?: string } = {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!values.email) {
        errors.email = "Email is required";
      } else if (!emailRegex.test(values.email)) {
        errors.email = "Please enter a valid email address";
      }
      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await useSendOtp({
          email: values.email,
          exsists: false,
        });
        console.log(response, "RES");
        if (
          response?.success ||
          response?.status === "success" ||
          response?.message?.toLowerCase().includes("sent")
        ) {
          toast({
            title: "Verification code sent!",
            duration: 2000,
            type: "success",
          });
          const email = await AsyncStorage.setItem("email", values.email);
          // Navigate to the next page (e.g., verify-otp)
          router.push("/(entry)/auth/verify-otp");
        } else {
          toast({
            title: response?.message || "Failed to send verification code.",
            duration: 2000,
            type: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView padding={20} flex={1}>
        <BackButton />

        <ThemedView marginTop={20}>
          <ThemedText fontSize={25} weight="semibold">
            Forgot Password
          </ThemedText>
          <ThemedText fontSize={13} color="#666" marginTop={2} lineHeight={22}>
            Enter an email address and we'll send you a verification code
          </ThemedText>
        </ThemedView>

        <ThemedView marginTop={5} flex={1}>
          <InputField
            icon={<Sms size={20} color="#ddd" />}
            label="Email Address"
            placeholder="you@gmail.com"
            value={formik.values.email}
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
            keyboardType="email-address"
          />
          {formik.touched.email && formik.errors.email && (
            <ThemedText color="red" marginTop={4} fontSize={14}>
              {formik.errors.email}
            </ThemedText>
          )}

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
              isLoading={loading}
              onPress={() => formik.handleSubmit()}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({});
