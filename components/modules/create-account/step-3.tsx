import React from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import NativeButton from "@/components/ui/native-button";
import { Profile, TickCircle } from "iconsax-react-native";

interface Step3Props {
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

const Step3 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step3Props) => {
  return (
    <ThemedView>
      <ThemedView>
        <BackButton />
        <ThemedText marginTop={20} fontSize={30}>
          Let's create a new account
        </ThemedText>
        <ThemedText marginTop={7}>
          Create an account by filling out the form below.
        </ThemedText>
      </ThemedView>

      <InputField
        icon={<Profile color="#ddd" size={20} />}
        placeholder="Your Full Name"
        label="Full Name"
        value={values.fullName}
        onChangeText={handleChange("fullName")}
        onBlur={() => handleBlur("fullName")}
      />
      {touched.fullName && errors.fullName && (
        <ThemedText color="red" marginTop={4}>{errors.fullName}</ThemedText>
      )}

      <InputField
        icon={<TickCircle color="#ddd" size={20} />}
        placeholder="Your Username"
        label="Username"
        value={values.username}
        onChangeText={handleChange("username")}
        onBlur={() => handleBlur("username")}
      />
      {touched.username && errors.username && (
        <ThemedText color="red" marginTop={4}>{errors.username}</ThemedText>
      )}

      <ThemedView
        width={"30%"}
        justifyContent="flex-end"
        alignSelf="flex-end"
        marginTop={20}
      >
        <ThemedView flexDirection="row" justifyContent="flex-end">
          <NativeButton
            onPress={onNext}
            text={isLast ? "Submit" : "Next"}
            mode="fill"
            style={{ borderRadius: 100 }}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default Step3;
