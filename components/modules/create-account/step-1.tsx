import React, { useState } from "react";
import { View } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import InputField from "@/components/common/input-field";
import { Sms } from "iconsax-react-native";
import BackButton from "@/components/common/back-button";
import { useSendOtp } from "@/hooks/auth-hooks.hooks";

interface Step1Props {
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

const Step1 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step1Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleNext = async () => {
    setLoading(true);
    const response = await useSendOtp({ email: values.email });
    console.log(response);
    if (response?.message) {
      setLoading(false);
      onNext();
    } else {
      setLoading(false);
    }
  };
  return (
    <ThemedView>
      <BackButton />
      <ThemedText marginTop={20} fontSize={30}>
        What's your email address?
      </ThemedText>
      <ThemedText marginTop={7} color="#666">
        We'll use your email to send account updates and help you recover access
        if needed.
      </ThemedText>

      <InputField
        label="Email Address"
        icon={<Sms size={22} color="#ddd" style={{ marginRight: 8 }} />}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={values.email}
        onChangeText={handleChange("email")}
        onBlur={() => handleBlur("email")}
      />
      {touched.email && errors.email && (
        <ThemedText color="red" marginTop={4}>
          {errors.email}
        </ThemedText>
      )}
      <ThemedView
        width={"30%"}
        justifyContent="flex-end"
        alignSelf="flex-end"
        marginTop={20}
      >
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <NativeButton
            onPress={handleNext}
            text="Next"
            mode="fill"
            isLoading={loading}
            style={{ borderRadius: 100, width: "100%" }}
          />
        </View>
      </ThemedView>
    </ThemedView>
  );
};

export default Step1;
