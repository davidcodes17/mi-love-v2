import React from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import InputField from "@/components/common/input-field";

interface Step5Props {
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

const Step5 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step5Props) => {
  return (
    <ThemedView>
      <ThemedView>
        <ThemedText marginTop={20} fontSize={30}>
          Setting up extra Security
        </ThemedText>
        <ThemedText marginTop={7}>
          Add a valid emergency contact email address.
        </ThemedText>
      </ThemedView>

      <ThemedView marginTop={20}>
        <InputField
          label="Emergency Contact Email"
          value={values.emergencyContact}
          onChangeText={handleChange("emergencyContact")}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={touched.emergencyContact && errors.emergencyContact ? errors.emergencyContact : undefined}
        />
      </ThemedView>

      <ThemedView
        width={"30%"}
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

export default Step5;
