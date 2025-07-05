import React from "react";
import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import { Profile } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

interface Step9Props {
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

const Step9 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step9Props) => {
  return (
    <ScrollView
      //   style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView padding={10}>
        <BackButton />

        <ThemedText marginTop={20} fontSize={30} weight="bold">
          Tell Us More About Yourself
        </ThemedText>
        <ThemedText marginTop={7} color="#666" fontSize={16}>
          Share a bit about yourself to help others get to know you better.
        </ThemedText>

                    <ThemedView marginTop={30}>
              <ThemedText fontSize={16} weight="bold" marginBottom={8}>
                Bio
              </ThemedText>
              <ThemedView
                borderWidth={1}
                borderColor="#ddd"
                borderRadius={12}
                padding={16}
                backgroundColor="#fff"
                minHeight={120}
              >
                <TextInput
                  placeholder="Tell us about your interests, hobbies, or what makes you unique..."
                  value={values.bio}
                  onChangeText={handleChange("bio")}
                  onBlur={() => handleBlur("bio")}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={{
                    fontSize: 16,
                    color: "#333",
                    minHeight: 100,
                    textAlignVertical: "top",
                  }}
                  placeholderTextColor="#999"
                />
              </ThemedView>
              {touched.bio && errors.bio && (
                <ThemedText color="red" marginTop={4} fontSize={14}>
                  {errors.bio}
                </ThemedText>
              )}
            </ThemedView>

        <ThemedView
          width={"100%"}
          justifyContent="flex-end"
          alignItems="center"
          marginTop={40}
          marginBottom={20}
        >
          <NativeButton
            onPress={onNext}
            text={isLast ? "Submit" : "Next"}
            mode="fill"
            style={{ borderRadius: 100, width: "60%", height: 50 }}
          />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

export default Step9;

const styles = StyleSheet.create({});
