import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import PhoneInput from "@/components/common/phone-input";

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
          Make sure the phone number you enter is registered on WhatsApp.
        </ThemedText>
      </ThemedView>

      <ThemedView marginTop={20}>
        <ThemedText marginBottom={6}>Emergency Contact</ThemedText>
        <PhoneInput
          value={values.emergencyContact}
          onChangeText={handleChange("emergencyContact")}
          placeholder="Phone number"
          defaultCountryCode="NG"
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

const styles = StyleSheet.create({
  phoneContainer: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
  },
  phoneTextContainer: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: "#fff",
    paddingLeft: 8,
  },
  flagButton: {
    width: 70,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    marginRight: 0,
    paddingRight: 8,
  },
});
