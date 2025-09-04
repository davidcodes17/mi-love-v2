import React from "react";
import { TextInput, TextInputProps } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";

type InputFieldProps = {
  label: string;
  icon: React.ReactNode;
  placeholder?: string;
} & TextInputProps;

const InputField = ({
  label,
  icon,
  placeholder,
  ...props
}: InputFieldProps) => {
  return (
    <ThemedView marginTop={20}>
      <ThemedText>{label}</ThemedText>
      <ThemedView
        marginTop={5}
        borderWidth={0.3}
        borderColor={"#ddd"}
        padding={3}
        paddingHorizontal={10}
        borderRadius={10}
        alignItems="center"
        flexDirection="row"
      >
        {icon}
        <TextInput
          placeholder={placeholder}
          style={{
            padding: 10,
            width: "100%",
            borderRadius: 10,
            fontSize: 15,
            fontFamily: "Quicksand_500Medium",
          }}
          {...props}
        />
      </ThemedView>
    </ThemedView>
  );
};

export default InputField;
