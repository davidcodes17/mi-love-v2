import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Platform,
  View,
  Pressable,
  Text,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { Calendar, Call, Flag } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Easing } from "react-native-reanimated";

const CreateAccount2 = () => {
  const offsetY = useSharedValue(40);
  const opacity = useSharedValue(0);
  const [dob, setDob] = useState(new Date());
  const bottomSheetRef = useRef<BottomSheet>(null);

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

  const snapPoints = useMemo(() => ["25%"], []);
  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);
  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    if (Platform.OS === "android") closeBottomSheet();
  };
  

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

            {/* Date of Birth Section with Bottom Sheet */}
            <ThemedView marginTop={15}>
              <ThemedText marginBottom={5}>Date of Birth</ThemedText>
              <ThemedView
                flexDirection="row"
                alignItems="center"
                borderWidth={0.5}
                borderColor="#ddd"
                borderRadius={10}
                padding={15}
              >
                <Calendar color="#ddd" size={20} />
                <Pressable style={{ marginLeft: 10 }} onPress={openBottomSheet}>
                  <Text
                    style={{
                      fontFamily: "Quicksand_500Medium",
                      color: "#ddd",
                    }}
                  >
                    {dob.toDateString()}
                  </Text>
                </Pressable>
              </ThemedView>
            </ThemedView>

            {/* Other fields */}
            <InputField
              icon={<Flag color="#ddd" size={20} />}
              placeholder="Your Country Name"
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
                style={{ borderRadius: 100 }}
              />
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </ScrollView>

      {/* Bottom Sheet for Date Picker */}
      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints}>
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontFamily: "Quicksand_600SemiBold",
              fontSize: 16,
              marginBottom: 10,
            }}
          >
            Select Date of Birth
          </Text>
          <DateTimePicker
            value={dob}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default CreateAccount2;

const styles = StyleSheet.create({});
