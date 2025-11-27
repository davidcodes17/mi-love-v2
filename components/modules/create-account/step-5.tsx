import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import PhoneInput from "react-native-phone-number-input";

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
          defaultValue={values.emergencyContact}
          defaultCode="NG"
          layout="first"
          onChangeFormattedText={(text) =>
            handleChange("emergencyContact")(text)
          }
          containerStyle={styles.phoneContainer}
          textContainerStyle={styles.phoneTextContainer}
          codeTextStyle={{ color: "#000", fontSize: 16 }}
          textInputStyle={{ color: "#000", fontSize: 16 }}
          flagButtonStyle={styles.flagButton}
          withDarkTheme={false}
          withShadow={false}
        />
        {touched.emergencyContact && errors.emergencyContact && (
          <ThemedText color="red" marginTop={4}>
            {errors.emergencyContact}
          </ThemedText>
        )}
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F6FA",
  },
  phoneTextContainer: {
    borderRadius: 14,
    backgroundColor: "#F5F6FA",
  },
  flagButton: {
    marginRight: 8,
  },
});
