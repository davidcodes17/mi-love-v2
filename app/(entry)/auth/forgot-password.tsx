import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { Sms } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import { useRouter } from "expo-router";
import { useForgotPassword } from "@/hooks/auth-hooks.hooks";
import { AUTH_STORAGE_KEYS } from "@/services/auth-service.service";
import { toast } from "@/components/lib/toast-manager";
import { useFormik } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "@/hooks/use-theme";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
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
        const response = await useForgotPassword({ email: values.email.trim() });
        if (
          response?.success ||
          response?.status === "success" ||
          response?.message?.toLowerCase().includes("sent")
        ) {
          toast.success("Verification code sent!");
          await AsyncStorage.setItem(
            AUTH_STORAGE_KEYS.resetEmail,
            values.email.trim()
          );
          // Navigate to the next page (e.g., verify-otp)
          router.push("/(entry)/auth/verify-otp");
        } else {
          toast.error(response?.message || "Failed to send verification code.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView padding={24} flex={1}>
        <BackButton />

        <ThemedView marginTop={34}>
          <View style={[styles.iconBadge, { backgroundColor: theme.colors.soft }]}>
            <Ionicons name="key-outline" size={25} color={theme.colors.primary} />
          </View>
          <ThemedText style={styles.title} weight="bold">
            Forgot your password?
          </ThemedText>
          <ThemedText fontSize={14} color={theme.colors.muted} marginTop={8} lineHeight={22}>
            No worries. Enter the email linked to your account and we’ll send a secure reset code.
          </ThemedText>
        </ThemedView>

        <ThemedView marginTop={5} flex={1}>
          <InputField
            icon={<Sms size={20} color={theme.colors.primary} />}
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

const styles = StyleSheet.create({
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 29,
    letterSpacing: -0.7,
  },
});
