import React, { useEffect, useState } from "react";
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
import { Profile } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import { UserProfile } from "@/types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useCreateAccountService,
  useNotificationService,
  useSendOtp,
} from "@/hooks/auth-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { registerForPushNotificationsAsync } from "@/utils/fcm-token.utils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const createAccount = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      // console.log(token,"TKN")
      if (!token) {
        setLoading(false);
        toast.error("No Token Found");
        return;
      }
      const data: UserProfile = {
        email: values.email,
        token: token?.toString(),
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
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
        toast.show({
          type: "success",
          title: "Account Creation Successfull",
          position: "bottom",
          visibilityTime: 4000,
        });
        await AsyncStorage.setItem("token", response?.access_token);
        
        // Send FCM token after account creation
        if (expoPushToken) {
          try {
            await useNotificationService({ token: expoPushToken });
            console.log("✅ FCM token sent after account creation");
          } catch (fcmError) {
            console.error("Failed to send FCM token:", fcmError);
            // Don't block account creation if FCM fails
          }
        } else {
          // If token not ready yet, try to get it and send
          registerForPushNotificationsAsync().then(async (token) => {
            if (token) {
              try {
                await useNotificationService({ token });
                console.log("✅ FCM token sent after account creation (delayed)");
              } catch (fcmError) {
                console.error("Failed to send FCM token (delayed):", fcmError);
              }
            }
          });
        }
        
        onNext();
      } else {
        setLoading(false);
        toast.show({
          type: "error",
          title: response?.message || "Account Creation Failed",
          position: "bottom",
          visibilityTime: 4000,
        });
      }
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      toast.error("Check your Internet Connection");
    }
  };




  return (
    <ScrollView
      style={{
        height,
      }}
    >
      <ThemedView padding={10}>

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
