import { StyleSheet, Text, TextProps, TextStyle } from "react-native";
import React from "react";
import useTheme from "@/hooks/use-theme";

export type NativeTextWeight =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold";
export interface NativeTextProps extends TextProps {
  weight?: NativeTextWeight;
}

const NativeText = (props: NativeTextProps) => {
  const { children, style, weight, ...rest } = props;
  const theme = useTheme();
  const color = theme.colors.text;
  const requestedWeight = weight || StyleSheet.flatten(style)?.fontWeight;
  let fontFamily = "Quicksand_400Regular";
  let fontWeight: TextStyle["fontWeight"];
  switch (requestedWeight) {
    case "light":
    case "300":
      fontFamily = "Quicksand_300Light";
      fontWeight = "300";
      break;

    case "regular":
    case "400":
      fontFamily = "Quicksand_400Regular";
      fontWeight = "400";
      break;

    case "medium":
    case "500":
      fontFamily = "Quicksand_500Medium";
      fontWeight = "500";
      break;

    case "semibold":
    case "600":
      fontFamily = "Quicksand_600SemiBold";
      fontWeight = "600";
      break;

    case "bold":
    case "700":
      fontFamily = "Quicksand_700Bold";
      fontWeight = "700";
      break;

    default:
      fontWeight = "400";
      break;
  }
  return (
    <Text
      style={[
        {
          fontFamily,
          fontWeight,
          color,
        },
        style,
      ]}
      {...rest}
      allowFontScaling={false}
    >
      {children}
    </Text>
  );
};

export default NativeText;
