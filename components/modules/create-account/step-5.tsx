import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { CallIncoming, Profile, Sms, TickCircle } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

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
        <BackButton />
        <ThemedText marginTop={20} fontSize={30}>
          Setting up extra Security
        </ThemedText>
        <ThemedText marginTop={7}>
          Make sure the phone number you enter is registered on WhatsApp.
        </ThemedText>
      </ThemedView>

      <InputField
        icon={<CallIncoming color="#ddd" size={20} />}
        placeholder="+1 234 567 8900"
        label="Emergency Contact"
        value={values.emergencyContact}
        onChangeText={handleChange("emergencyContact")}
        onBlur={() => handleBlur("emergencyContact")}
      />
      {touched.emergencyContact && errors.emergencyContact && (
        <ThemedText color="red" marginTop={4}>{errors.emergencyContact}</ThemedText>
      )}

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

const styles = StyleSheet.create({});
