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
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { Calendar, Profile, Image as ImageIcon } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { COLORS } from "@/config/theme";
import { useUploadService } from "@/hooks/auth-hooks.hooks";
import toast from "@originaltimi/rn-toast";

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
      toast({
        title: "Please select an image first.",
        duration: 2000,
        type: "error",
      });
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
      toast({
        title: "Image uploaded successfully!",
        duration: 2000,
        type: "success",
      });
      // This ID
      console.log(response?.data[0]?.id, "SJSJ");
      handleChange("profileImage")(response?.data[0]?.id);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Upload error:", error);
      toast({
        title: "Image upload failed.",
        duration: 2000,
        type: "error",
      });
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
          <BackButton />
          <ThemedText marginTop={20} fontSize={30}>
            We'd like to know you more
          </ThemedText>
          <ThemedText marginTop={7}>Complete your profile below.</ThemedText>

          {/* Profile Image Upload */}
          <ThemedView alignItems="center" marginTop={20} marginBottom={10}>
            <TouchableOpacity
              onPress={handleImagePresentModalPress}
              style={{ alignItems: "center", width: "100%" }}
            >
              <Image
                source={
                  localImage
                    ? { uri: localImage }
                    : require("@/assets/user.png")
                }
                style={{
                  width: "100%",
                  height: 300,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
              <ThemedText
                fontSize={14}
                color={COLORS.primary}
                weight="medium"
                marginTop={8}
              >
                {localImage ? "Change Photo" : "Upload Photo"}
              </ThemedText>
            </TouchableOpacity>
            {/* Upload Button */}
            <NativeButton
              text="Upload"
              onPress={uploadImage}
              isLoading={loading}
              style={{ marginTop: 10, width: 150, borderRadius: 80 }}
              mode="outline"
            />
          </ThemedView>

          {/* Gender Picker */}
          <ThemedView marginTop={10}>
            <ThemedText>Gender</ThemedText>
            <TouchableOpacity onPress={handleGenderPresentModalPress}>
              <ThemedView
                borderWidth={0.3}
                borderColor={"#ddd"}
                borderRadius={10}
                marginTop={5}
                padding={12}
                flexDirection="row"
                alignItems="center"
                gap={10}
              >
                <Profile color="#ddd" size={20} />
                <ThemedText>
                  {values.gender
                    ? values.gender.charAt(0).toUpperCase() +
                      values.gender.slice(1)
                    : "Select Gender"}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
            {touched.gender && errors.gender && (
              <ThemedText color="red" marginTop={4}>
                {errors.gender}
              </ThemedText>
            )}
          </ThemedView>

          {/* Date of Birth Picker */}
          <ThemedView marginTop={10}>
            <ThemedText>Date of Birth</ThemedText>
            <TouchableOpacity
              onPress={handleDatePresentModalPress}
              style={{ marginTop: 5 }}
            >
              <ThemedView
                borderWidth={0.3}
                borderColor={"#ddd"}
                borderRadius={10}
                padding={12}
                flexDirection="row"
                alignItems="center"
                gap={10}
              >
                <Calendar color="#ddd" size={20} />
                <ThemedText>
                  {values.dob ? values.dob : "Select your date of birth"}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
            {touched.dob && errors.dob && (
              <ThemedText color="red" marginTop={4}>
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
