import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import NativeText, { NativeTextProps } from "./native-text";
import { COLORS } from "@/config/theme";
import { Href, router } from "expo-router";

export interface NativeButtonProps extends PressableProps {
  textOptions?: NativeTextProps;
  isLoading?: boolean;
  mode: "fill" | "outline" | "text";
  style?: ViewStyle;
  href?: Href;
  text: any;
}

const NativeButton = (props: NativeButtonProps) => {
  const {
    textOptions,
    mode,
    style,
    text,
    children,
    isLoading,
    disabled,
    href,
    ...rest
  } = props;

  // Determine button styles based on mode
  let buttonStyle;
  switch (mode) {
    case "fill":
      buttonStyle = styles.fillButton;
      break;
    case "outline":
      buttonStyle = styles.outlineButton;
      break;
    case "text":
      buttonStyle = styles.textButton;
      break;
    default:
      buttonStyle = styles.textButton;
  }

  return (
    <Pressable
      onPress={() => {
        href && router.navigate(href);
      }}
      style={[
        styles.button,
        buttonStyle,
        style,
        {
          opacity: isLoading || disabled ? 0.8 : 1,
        },
      ]}
      disabled={isLoading || disabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={mode != "fill" ? COLORS.primary : "#fff"} />
      ) : (
        <>
          {children || (
            <NativeText
              style={[
                { fontSize: 12 },
                mode === "fill" && { color: "#fff" },
                mode === "outline" && { color: COLORS.primary },
                textOptions?.style,
              ]}
              {...textOptions}
            >
              {text}
            </NativeText>
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  fillButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  textButton: {
    backgroundColor: "transparent",
  },
});

export default NativeButton;
