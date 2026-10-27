import React, { useState } from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "@/hooks/use-theme";

type InputFieldProps = {
  label?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  error?: string;
} & TextInputProps;

const InputField = ({
  label,
  icon,
  placeholder,
  error,
  secureTextEntry,
  style,
  ...props
}: InputFieldProps) => {
  const [isSecure, setIsSecure] = useState(!!secureTextEntry);
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      {!!label && <Text style={[styles.label, { color: theme.colors.muted }]}>{label}</Text>}
      <View style={[styles.field, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }, !!error && { borderColor: theme.colors.error }]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { color: theme.colors.text }, style]}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure((prev) => !prev)}
            hitSlop={10}
            style={styles.eye}
          >
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={theme.colors.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#806f78",
    marginBottom: 6,
  },
  field: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#f0e3e8",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldError: {
    borderColor: "#ED4956",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#281a22",
  },
  eye: {
    paddingLeft: 8,
  },
  error: {
    marginTop: 6,
    color: "#D9435F",
    fontSize: 12,
  },
});
