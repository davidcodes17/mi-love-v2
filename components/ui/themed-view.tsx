import { TextStyle, View, ViewStyle } from "react-native";
import React, { ReactNode } from "react";
import NativeText, { NativeTextWeight } from "./native-text";

type ThemedViewProps = {
  children?: ReactNode;
} & ViewStyle;

const ThemedView = ({ children, ...rest }: ThemedViewProps) => {
  return <View style={rest}>{children}</View>;
};

type ThemedTextProps = {
  children: ReactNode;
  weight?: NativeTextWeight;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
} & TextStyle;

export const ThemedText = ({ children, weight, numberOfLines, ellipsizeMode, ...rest }: ThemedTextProps) => {
  return (
    <NativeText weight={weight} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode} style={rest}>
      {children}
    </NativeText>
  );
};

export default ThemedView;
