import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { Lock, Lock1 } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

interface Step6Props {
  values: any;
  errors: any;
  touched: any;
  handleChange: (field: string) => (value: any) => void;
  handleBlur: (field: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const Step6 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step6Props) => {
  return (
    <ThemedView>
      <BackButton />
      <ThemedText marginTop={20} fontSize={30}>
        Security Setup
      </ThemedText>
      <ThemedText marginTop={7}>
        Create an account by filling out the form below.
      </ThemedText>

      <InputField
        icon={<Lock color="#ddd" size={20} />}
        placeholder="Shhh! Keep it secret"
        label="Password"
        value={values.password}
        onChangeText={handleChange("password")}
        onBlur={() => handleBlur("password")}
      />
      {touched.password && errors.password && (
        <ThemedText color="red" marginTop={4}>{errors.password}</ThemedText>
      )}
      <InputField
        icon={<Lock1 color="#ddd" size={20} />}
        placeholder="* * * * * * * * * * * * * * * * * * * * * * *"
        label="Are you sure? Let's see"
        value={values.confirmPassword}
        onChangeText={handleChange("confirmPassword")}
        onBlur={() => handleBlur("confirmPassword")}
      />
      {touched.confirmPassword && errors.confirmPassword && (
        <ThemedText color="red" marginTop={4}>{errors.confirmPassword}</ThemedText>
      )}

      <ThemedView
        width={"40%"}
        justifyContent="flex-end"
        alignSelf="flex-end"
        marginTop={20}
      >
        <NativeButton
          onPress={onNext}
          text={isLast ? "Submit" : "Next"}
          mode="fill"
          style={{ borderRadius: 100 }}
        />
      </ThemedView>
    </ThemedView>
  );
};

export default Step6;

const styles = StyleSheet.create({});
