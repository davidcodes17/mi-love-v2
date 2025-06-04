import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import {
  Calendar,
  Call,
  Flag,
  Profile2User,
} from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const CreateAccount2 = () => {
  const offsetY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    offsetY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ScrollView>
        <Animated.View style={[animatedStyle]}>
          <ThemedView padding={20}>
            <BackButton />
            <ThemedText marginTop={20} fontSize={30}>
              Tell us a bit about yourself.
            </ThemedText>
            <ThemedText marginTop={7}>
              Create an account by filling out the form below.
            </ThemedText>

            <InputField
              icon={<Profile2User color="#ddd" size={20} />}
              placeholder="Male or Female"
              label="Gender"
            />
            <InputField
              icon={<Calendar color="#ddd" size={20} />}
              placeholder="Date of Birth"
              label="Date Of Birth"
            />
            <InputField
              icon={<Flag color="#ddd" size={20} />}
              placeholder="Country"
              label="Country"
            />
            <InputField
              icon={<Call color="#ddd" size={20} />}
              placeholder="Phone Number"
              label="Phone Number"
            />

            <ThemedView
              width={"30%"}
              justifyContent="flex-end"
              alignSelf="flex-end"
              marginTop={20}
            >
              <NativeButton
                href={"/auth/create-account3"}
                text={"Next"}
                mode="fill"
                style={{
                  borderRadius: 100,
                }}
              />
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAccount2;

const styles = StyleSheet.create({});
