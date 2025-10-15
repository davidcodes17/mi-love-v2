import React, { useState } from "react";
import { TextInput, TextInputProps, TouchableOpacity } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { useTheme } from "@react-navigation/native";
import { Eye, EyeSlash } from "iconsax-react-native";

type InputFieldProps = {
  label: string;
  icon: React.ReactNode;
  placeholder?: string;
} & TextInputProps;

const InputField = ({
  label,
  icon,
  placeholder,
  secureTextEntry,
  ...props
}: InputFieldProps) => {
  const theme = useTheme();
  const [isSecure, setIsSecure] = useState(!!secureTextEntry);

  const toggleSecure = () => setIsSecure((prev) => !prev);

  return (
    <ThemedView marginTop={20}>
      <ThemedText color={theme.colors.text}>{label}</ThemedText>
      <ThemedView
        marginTop={5}
        borderWidth={0.3}
        borderColor={theme.colors.border}
        padding={3}
        paddingHorizontal={10}
        borderRadius={10}
        alignItems="center"
        flexDirection="row"
      >
        {icon}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text + "80"}
          style={{
            padding: 10,
            flex: 1,
            borderRadius: 10,
            color: theme.colors.text,
            fontSize: 15,
            fontFamily: "Quicksand_500Medium",
          }}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecure}>
            {isSecure ? (
              <EyeSlash size={20} color={theme.colors.text} />
            ) : (
              <Eye size={20} color={theme.colors.text} />
            )}
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
};

export default InputField;
