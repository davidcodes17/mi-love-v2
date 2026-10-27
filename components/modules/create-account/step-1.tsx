import React, { useState } from "react";
import ThemedView from "@/components/ui/themed-view";
import InputField from "@/components/common/input-field";
import { useSendOtp } from "@/hooks/auth-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import {
  StepError,
  StepNext,
  StepTitle,
} from "@/components/modules/create-account/step-chrome";

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
}: Step1Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleNext = async () => {
    if (!values.email?.trim() || errors.email) {
      toast.error(errors.email || "Email is required");
      return;
    }
    setLoading(true);
    const response = await useSendOtp({
      email: values.email.trim(),
      exsists: true,
    });
    if (response?.message) {
      setLoading(false);
      onNext();
    } else {
      setLoading(false);
    }
  };

  return (
    <ThemedView>
      <StepTitle
        title="What's your email?"
        subtitle="Enter the email where you can be contacted. No one will see this on your profile."
      />

      <InputField
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={values.email}
        onChangeText={handleChange("email")}
        onBlur={() => handleBlur("email")}
      />
      <StepError
        message={
          touched.email && errors.email ? String(errors.email) : undefined
        }
      />
      <StepNext onPress={handleNext} loading={loading} text="Next" />
    </ThemedView>
  );
};

export default Step1;
