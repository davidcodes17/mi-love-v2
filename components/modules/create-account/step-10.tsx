import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import { TickCircle } from "iconsax-react-native";

interface Step10Props {
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

const Step10 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step10Props) => {
  console.log("object",values)

  useEffect(()=>{
    console.log("Login THIS")
  },[])
  
  return (
    <ScrollView 
      // style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      // contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView 
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding={20}
        minHeight={600}
      >
        {/* Success Icon */}
        <ThemedView 
          alignItems="center"
          justifyContent="center"
          marginBottom={20}
        >
          <TickCircle size={80} color="#4CAF50" />
        </ThemedView>

        {/* Main Title */}
        <ThemedText fontSize={34} weight="bold" textAlign="center" marginTop={20}>
          🎉 Thank You!
        </ThemedText>

        {/* Subtitle */}
        <ThemedText
          marginTop={15}
          fontSize={18}
          color="#666"
          textAlign="center"
          lineHeight={24}
        >
          Your account has been created successfully!
        </ThemedText>

        {/* Description */}
        <ThemedText
          marginTop={10}
          fontSize={16}
          color="#888"
          textAlign="center"
          lineHeight={22}
        >
          Welcome to our community! Your profile is now ready and you can start connecting with others.
        </ThemedText>

        {/* Action Buttons */}
        <ThemedView 
          width="100%"
          marginTop={40}
          paddingHorizontal={20}
        >
          <NativeButton
            href="/home"
            text="Go to Home"
            mode="fill"
            style={{ borderRadius: 100, width: "100%", height: 50 }}
          />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

export default Step10; 