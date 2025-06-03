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
  Lock,
  Lock1,
  Note,
  Personalcard,
  Profile,
  Profile2User,
  Sms,
  TickCircle,
} from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

const CreateAccount4 = () => {
  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ScrollView>
        <ThemedView padding={20}>
          <ThemedView>
            <BackButton />
            <ThemedText marginTop={20} fontSize={30}>
              Security Setup
            </ThemedText>
            <ThemedText marginTop={7}>
              Create an account by filling out the form below.
            </ThemedText>
          </ThemedView>

          <InputField
            icon={<Lock color="#ddd" size={20} />}
            placeholder="Shhh! Keep it secret"
            label="Password"
          />
          <InputField
            icon={<Lock1 color="#ddd" size={20} />}
            placeholder="* * * * * * * * * * * * * * * * * * * * * * *"
            label="Are you sure? Let's see"
          />

          <ThemedView
            width={"30%"}
            justifyContent="flex-end"
            alignSelf="flex-end"
            marginTop={20}
          >
            <NativeButton
              href={"/home"}
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

export default CreateAccount4;

const styles = StyleSheet.create({});
