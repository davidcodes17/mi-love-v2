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
                mode == "fill"
                  ? {
                      color: "#fff",
                    }
                  : {},
                mode == "outline"
                  ? {
                      color: COLORS.primary,
                    }
                  : {},
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
    borderRadius: 8,
    padding: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  fillButton: {
    backgroundColor: COLORS.primary,
  },
  outlineButton: {
    borderWidth: 0.7,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
  },
  textButton: {
    backgroundColor: "transparent",
  },
});

export default NativeButton;
