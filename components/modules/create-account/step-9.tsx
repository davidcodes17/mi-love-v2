import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import { Profile } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import { UserProfile } from "@/types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCreateAccountService } from "@/hooks/auth-hooks.hooks";
import toast from "@originaltimi/rn-toast";

interface Step9Props {
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

const Step9 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step9Props) => {
  const height = Dimensions.get("window").height;
  const [loading, setLoading] = useState<boolean>(false);

  const createAccount = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      // console.log(token,"TKN")
      if (!token) {
        setLoading(false);
        toast({
          title: "No Token Found",
          type: "error",
        });
        return;
      }
      const data: UserProfile = {
        email: values.email,
        token: token?.toString(),
        password: values.password,
        first_name: values.fullName.split(" ")[0] || "",
        last_name: values.fullName.split(" ")[1] || "",
        username: values.username,
        emergency_contact: values.emergencyContact,
        bio: values.bio,
        profile_picture: values.profileImage,
        home_address: values.home_address,
        interests: values.interests,
        phone_number: values.phonenumber,
        country: values.country,
        gender: values.gender,
        date_of_birth: new Date(values.dob).toISOString(),
      };

      console.log(data, "DATA");

      const response = await useCreateAccountService({ data });

      console.log(response);
      if (response?.access_token) {
        setLoading(false);
        toast({
          title: "Account Creation Successfull",
          duration: 4000,
          position: "bottom",
          type: "success",
        });
        await AsyncStorage.setItem("token", response?.access_token);
        onNext();
      } else {
        setLoading(false);
        toast({
          title: response?.message || "Account Creation Failed",
          duration: 4000,
          position: "bottom",
          type: "success",
        });
      }
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      toast({
        title: "Check your Internet Connection",
        duration: 4000,
        type: "error",
      });
    }
  };

  return (
    <ScrollView
      style={{
        height,
      }}
    >
      <ThemedView padding={10}>
        <BackButton />

        <ThemedText marginTop={20} fontSize={30} weight="bold">
          Tell Us More About Yourself
        </ThemedText>
        <ThemedText marginTop={7} color="#666" fontSize={16}>
          Share a bit about yourself to help others get to know you better.
        </ThemedText>

        <ThemedView marginTop={30}>
          <ThemedText fontSize={16} weight="bold" marginBottom={8}>
            Bio
          </ThemedText>
          <ThemedView
            borderWidth={1}
            borderColor="#ddd"
            borderRadius={12}
            padding={16}
            backgroundColor="#fff"
            minHeight={120}
          >
            <TextInput
              placeholder="Tell us about your interests, hobbies, or what makes you unique..."
              value={values.bio}
              onChangeText={handleChange("bio")}
              onBlur={() => handleBlur("bio")}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{
                fontSize: 16,
                color: "#333",
                minHeight: 100,
                fontFamily: "Quicksand_500Medium",
                textAlignVertical: "top",
              }}
              placeholderTextColor="#999"
            />
          </ThemedView>
          {touched.bio && errors.bio && (
            <ThemedText color="red" marginTop={4} fontSize={14}>
              {errors.bio}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView
          width={"100%"}
          justifyContent="flex-end"
          alignItems="center"
          marginTop={40}
          marginBottom={20}
        >
          <NativeButton
            onPress={() => {
              createAccount();
            }}
            text={isLast ? "Submit" : "Next"}
            mode="fill"
            isLoading={loading}
            style={{ borderRadius: 100, width: "60%", height: 50 }}
          />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

export default Step9;

const styles = StyleSheet.create({});
