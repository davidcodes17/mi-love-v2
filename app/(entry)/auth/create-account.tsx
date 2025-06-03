import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { Profile, Sms, TickCircle } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

const CreateAccount = () => {
  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ScrollView>
        <ThemedView padding={20}>
          <ThemedView>
            <BackButton />
            <ThemedText marginTop={20} fontSize={30}>
              Let's create a new account
            </ThemedText>
            <ThemedText marginTop={7}>
              Create an account by filling out the form below.
            </ThemedText>
          </ThemedView>

          <InputField
            icon={<Profile color="#ddd" size={20} />}
            placeholder="Your Full Name"
            label="Full Name"
          />
          <InputField
            icon={<TickCircle color="#ddd" size={20} />}
            placeholder="Your Username"
            label="Username"
          />

          <ThemedView width={'30%'} justifyContent="flex-end" alignSelf="flex-end" marginTop={20}>
            <NativeButton href={"/auth/create-account2"} text={"Next"} mode="fill" style={{
              borderRadius : 100
            }} />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({});
