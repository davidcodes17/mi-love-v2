import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IG, onboardingStyles } from "@/components/styles/onboarding-styles";

export const StepTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <View style={styles.wrap}>
    <Text style={onboardingStyles.title}>{title}</Text>
    {!!subtitle && <Text style={onboardingStyles.subtitle}>{subtitle}</Text>}
  </View>
);

export const StepNext = ({
  onPress,
  text = "Next",
  loading = false,
  disabled = false,
}: {
  onPress: () => void;
  text?: string;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading || disabled}
    activeOpacity={0.85}
    style={[
      onboardingStyles.primaryBtn,
      (loading || disabled) && onboardingStyles.primaryBtnDisabled,
      styles.next,
    ]}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={onboardingStyles.primaryBtnText}>{text}</Text>
    )}
  </TouchableOpacity>
);

export const StepError = ({ message }: { message?: string }) =>
  message ? <Text style={styles.error}>{message}</Text> : null;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  next: {
    marginTop: 28,
    width: "100%",
  },
  error: {
    marginTop: 8,
    color: "#ED4956",
    fontSize: 12,
  },
});
