import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  View,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import InputField from "@/components/common/input-field";
import { Calendar, Profile, Image as ImageIcon } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { COLORS } from "@/config/theme";
import { useUploadService } from "@/hooks/auth-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";

interface Step7Props {
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

const Step7 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step7Props) => {
  const [localImage, setLocalImage] = useState(values.profileImage || null);
  const [loading, setLoading] = useState<boolean>(false);

  // Bottom sheet refs
  const genderBottomSheetRef = useRef<BottomSheetModal>(null);
  const dateBottomSheetRef = useRef<BottomSheetModal>(null);
  const imageBottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points
  const genderSnapPoints = useMemo(() => ["50%"], []);
  const dateSnapPoints = useMemo(() => ["60%"], []);
  const imageSnapPoints = useMemo(() => ["30%"], []);

  // Callbacks
  const handleGenderPresentModalPress = useCallback(() => {
    genderBottomSheetRef.current?.present();
  }, []);

  const handleDatePresentModalPress = useCallback(() => {
    dateBottomSheetRef.current?.present();
  }, []);

  const handleImagePresentModalPress = useCallback(() => {
    imageBottomSheetRef.current?.present();
  }, []);

  // Image picker handler
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLocalImage(result.assets[0].uri);
      // handleChange("profileImage")(result.assets[0].uri);
    }
    imageBottomSheetRef.current?.dismiss();
  };

  // Date picker handler
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      handleChange("dob")(selectedDate.toISOString().split("T")[0]);
    }
    dateBottomSheetRef.current?.dismiss();
  };

  // Gender selection handler
  const handleGenderSelect = (gender: string) => {
    handleChange("gender")(gender);
    genderBottomSheetRef.current?.dismiss();
  };
  const height = Dimensions.get("window").height;

  const uploadImage = async () => {
    if (!localImage) {
      toast.error("Please select an image first.");
      return;
    }

    setLoading(true);
    // Prepare file object for upload
    const file = {
      uri: localImage,
      name: "profile.jpg",
      type: "image/jpeg",
    };
    try {
      const response = await useUploadService({ file });
      console.log("Upload response:", response);
      toast.success("Image uploaded successfully!");
      // This ID
      console.log(response?.data[0]?.id, "SJSJ");
      handleChange("profileImage")(response?.data[0]?.id);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Upload error:", error);
      toast.error("Image upload failed.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <ScrollView
        style={{
          height: height - 100,
        }}
        // showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ paddingBottom: 20 }}
      >
        <ThemedView>
          <ThemedText marginTop={20} fontSize={32} weight="bold">
            Let's get to know you better! ✨
          </ThemedText>
          <ThemedText marginTop={8} fontSize={15} color="#666">
            Add your profile photo and personal details to complete your profile
          </ThemedText>

          {/* Profile Image Upload */}
          <ThemedView alignItems="center" marginTop={30} marginBottom={20}>
            <TouchableOpacity
              onPress={handleImagePresentModalPress}
              activeOpacity={0.9}
              style={{ alignItems: "center", width: "100%" }}
            >
              <View style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                borderWidth: 4,
                borderColor: COLORS.primary + "30",
                padding: 4,
                backgroundColor: "#f8f9fa",
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 8,
              }}>
                <Image
                  source={
                    localImage
                      ? { uri: localImage }
                      : require("@/assets/user.png")
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 100,
                  }}
                  resizeMode="cover"
                />
                <View style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: COLORS.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 3,
                  borderColor: "#fff",
                }}>
                  <ImageIcon size={24} color="#fff" variant="Bold" />
                </View>
              </View>
              <ThemedText
                fontSize={16}
                color={COLORS.primary}
                weight="600"
                marginTop={16}
              >
                {localImage ? "Change Photo" : "Tap to Add Photo"}
              </ThemedText>
              {localImage && (
                <NativeButton
                  text={loading ? "Uploading..." : "Upload Photo"}
                  onPress={uploadImage}
                  isLoading={loading}
                  style={{ marginTop: 12, paddingHorizontal: 30, borderRadius: 25 }}
                  mode="fill"
                />
              )}
            </TouchableOpacity>
          </ThemedView>

          {/* Gender Picker */}
          <ThemedView marginTop={20}>
            <ThemedText fontSize={16} weight="600" marginBottom={8}>
              Gender
            </ThemedText>
            <TouchableOpacity 
              onPress={handleGenderPresentModalPress}
              activeOpacity={0.7}
            >
              <ThemedView
                borderWidth={2}
                borderColor={values.gender ? COLORS.primary + "40" : "#e0e0e0"}
                borderRadius={16}
                padding={16}
                flexDirection="row"
                alignItems="center"
                gap={12}
                backgroundColor={values.gender ? COLORS.primary + "08" : "#f8f9fa"}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: values.gender ? COLORS.primary + "20" : "#e0e0e0",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <Profile color={values.gender ? COLORS.primary : "#999"} size={22} variant="Bold" />
                </View>
                <ThemedView flex={1}>
                  <ThemedText fontSize={15} weight={values.gender ? "600" : "400"} color={values.gender ? "#000" : "#999"}>
                    {values.gender
                      ? values.gender.charAt(0).toUpperCase() +
                        values.gender.slice(1)
                      : "Select your gender"}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
            {touched.gender && errors.gender && (
              <ThemedText color="red" marginTop={6} fontSize={13}>
                {errors.gender}
              </ThemedText>
            )}
          </ThemedView>

          {/* Date of Birth Picker */}
          <ThemedView marginTop={16}>
            <ThemedText fontSize={16} weight="600" marginBottom={8}>
              Date of Birth
            </ThemedText>
            <TouchableOpacity
              onPress={handleDatePresentModalPress}
              activeOpacity={0.7}
            >
              <ThemedView
                borderWidth={2}
                borderColor={values.dob ? COLORS.primary + "40" : "#e0e0e0"}
                borderRadius={16}
                padding={16}
                flexDirection="row"
                alignItems="center"
                gap={12}
                backgroundColor={values.dob ? COLORS.primary + "08" : "#f8f9fa"}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: values.dob ? COLORS.primary + "20" : "#e0e0e0",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <Calendar color={values.dob ? COLORS.primary : "#999"} size={22} variant="Bold" />
                </View>
                <ThemedView flex={1}>
                  <ThemedText fontSize={15} weight={values.dob ? "600" : "400"} color={values.dob ? "#000" : "#999"}>
                    {values.dob ? values.dob : "Select your date of birth"}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
            {touched.dob && errors.dob && (
              <ThemedText color="red" marginTop={6} fontSize={13}>
                {errors.dob}
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView
            marginBottom={20}
            width={"40%"}
            justifyContent="flex-end"
            alignSelf="flex-end"
            marginTop={20}
          >
            <NativeButton
              onPress={() => {
                console.log(values, "SK");
                onNext();
              }}
              text={isLast ? "Submit" : "Next"}
              mode="fill"
              style={{ borderRadius: 100 }}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Gender Selection BottomSheet */}
      <BottomSheetModal
        ref={genderBottomSheetRef}
        index={0}
        snapPoints={genderSnapPoints}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <ThemedText fontSize={20} marginBottom={20} textAlign="center">
            Select Gender
          </ThemedText>

          <TouchableOpacity
            onPress={() => handleGenderSelect("male")}
            style={{
              padding: 15,
              borderWidth: 1,
              borderColor: values.gender === "male" ? "#7B61FF" : "#ddd",
              borderRadius: 10,
              marginBottom: 10,
              backgroundColor:
                values.gender === "male" ? "#f0f0ff" : "transparent",
            }}
          >
            <ThemedText
              fontSize={16}
              color={values.gender === "male" ? "#7B61FF" : "#000"}
            >
              Male
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleGenderSelect("female")}
            style={{
              padding: 15,
              borderWidth: 1,
              borderColor: values.gender === "female" ? "#7B61FF" : "#ddd",
              borderRadius: 10,
              marginBottom: 10,
              backgroundColor:
                values.gender === "female" ? "#f0f0ff" : "transparent",
            }}
          >
            <ThemedText
              fontSize={16}
              color={values.gender === "female" ? "#7B61FF" : "#000"}
            >
              Female
            </ThemedText>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Date of Birth BottomSheet */}
      <BottomSheetModal
        ref={dateBottomSheetRef}
        index={0}
        snapPoints={dateSnapPoints}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <ThemedText fontSize={20} marginBottom={20} textAlign="center">
            Select Date of Birth
          </ThemedText>
          <DateTimePicker
            value={values.dob ? new Date(values.dob) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            style={{ alignSelf: "center" }}
          />
          <NativeButton
            text="Confirm"
            mode="fill"
            style={{ borderRadius: 100, marginTop: 20 }}
            onPress={() => dateBottomSheetRef.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Image Upload BottomSheet */}
      <BottomSheetModal
        ref={imageBottomSheetRef}
        index={0}
        snapPoints={imageSnapPoints}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20, alignItems: "center" }}>
          <ThemedText fontSize={20} marginBottom={20} textAlign="center">
            Upload Profile Photo
          </ThemedText>
          <NativeButton
            text="Choose from Gallery"
            mode="fill"
            style={{ borderRadius: 100, width: "100%" }}
            onPress={pickImage}
          />
          <NativeButton
            text="Cancel"
            mode="outline"
            style={{ borderRadius: 100, width: "100%", marginTop: 10 }}
            onPress={() => imageBottomSheetRef.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </KeyboardAvoidingView>
  );
};

export default Step7;

const styles = StyleSheet.create({});
