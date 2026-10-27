import {
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import React, { ReactNode } from "react";
import NativeText, { NativeTextWeight } from "./native-text";
import useTheme from "@/hooks/use-theme";

type ThemedViewProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
} & ViewStyle;

const ThemedView = ({ children, style, ...rest }: ThemedViewProps) => {
  const theme = useTheme();
  return (
    <View style={[{ backgroundColor: theme.colors.background }, rest, style]}>
      {children}
    </View>
  );
};

type ThemedTextProps = {
  children: ReactNode;
  weight?: NativeTextWeight;
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  style?: StyleProp<TextStyle>;
} & TextStyle;

export const ThemedText = ({
  children,
  weight,
  numberOfLines,
  ellipsizeMode,
  style,
  ...rest
}: ThemedTextProps) => {
  return (
    <NativeText
      weight={weight}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={[rest, style]}
    >
      {children}
    </NativeText>
  );
};

export default ThemedView;
