import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import {
  Calendar,
  Flag,
  Note,
  Personalcard,
  Profile,
  Profile2User,
  Sms,
  TickCircle,
} from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

const CreateAccount3 = () => {
  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ScrollView>
        <ThemedView padding={20}>
          <ThemedView>
            <BackButton />
            <ThemedText marginTop={20} fontSize={30}>
              Help us personalize your experience.
            </ThemedText>
            <ThemedText marginTop={7}>
              Create an account by filling out the form below.
            </ThemedText>
          </ThemedView>

          <InputField
            icon={<Note color="#ddd" size={20} />}
            placeholder="Tell us about yourself"
            label="Bio"
          />
          <InputField
            icon={<Personalcard color="#ddd" size={20} />}
            placeholder="Interests"
            label="Let's what interests you"
          />

          <ThemedView
            width={"30%"}
            justifyContent="flex-end"
            alignSelf="flex-end"
            marginTop={20}
          >
            <NativeButton
              href={"/auth/create-account4"}
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

export default CreateAccount3;

const styles = StyleSheet.create({});
