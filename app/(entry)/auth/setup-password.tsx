import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import {
  Calendar,
  CallAdd,
  Flag,
  Note,
  Personalcard,
  Profile,
  Profile2User,
  Sms,
  TickCircle,
} from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

const SetupPassword = () => {
  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ScrollView>
        <ThemedView padding={20}>
          <ThemedView>
            <BackButton />
            <ThemedText marginTop={20} fontSize={30}>
              Just a few secure steps to verify you
            </ThemedText>
            <ThemedText marginTop={7}>
              Create an account by filling out the form below.
            </ThemedText>
          </ThemedView>

          <InputField
            icon={<Sms color="#ddd" size={20} />}
            placeholder="you@gmail.com"
            label="Email Address"
          />
          <InputField
            icon={<CallAdd color="#ddd" size={20} />}
            placeholder="+000 000 0000"
            label="In case you ever need urgent help, we’ll contact someone you trust."
          />

          <ThemedView
            width={"30%"}
            justifyContent="flex-end"
            alignSelf="flex-end"
            marginTop={20}
          >
            <NativeButton
              href={"/auth/create-account2"}
              text={"Next"}
              mode="fill"
              style={{
                borderRadius: 100,
              }}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SetupPassword;

const styles = StyleSheet.create({});
