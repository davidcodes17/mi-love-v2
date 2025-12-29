import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import InputField from "@/components/common/input-field";
import BackButton from "@/components/common/back-button";
import { COLORS } from "@/config/theme";
import { useRouter } from "expo-router";
import {
  Camera,
  User,
  ProfileCircle,
  Call,
  Location,
  Calendar,
  Edit2,
  DocumentText,
} from "iconsax-react-native";
import { EditProfilePayload, UserProfileR } from "@/types/auth.types";
import { useGetProfile, useUploadService } from "@/hooks/auth-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import * as ImagePicker from "expo-image-picker";
import { generateURL } from "@/utils/image-utils.utils";
import { useUpdateAccountDetails } from "@/hooks/account-hooks.hooks";
import { useUserStore } from "@/store/store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";

const EditAccount = () => {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user: profile, setUser } = useUserStore();

  // Bottom sheet refs
  const genderBottomSheetRef = useRef<BottomSheetModal>(null);
  const countryBottomSheetRef = useRef<BottomSheetModal>(null);
  const dateBottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points
  const genderSnapPoints = useMemo(() => ["30%"], []);
  const countrySnapPoints = useMemo(() => ["50%"], []);
  const dateSnapPoints = useMemo(() => ["50%"], []);

  const [form, setForm] = useState<EditProfilePayload>({
    first_name: "",
    last_name: "",
    username: "",
    bio: "",
    phone_number: "",
    country: "",
    added_interests: [],
    date_of_birth: "",
    emergency_contact: "",
    gender: "male",
    home_address: "",
    profile_picture_id: "",
    removed_interests: [],
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        phone_number: profile.phone_number || "",
        country: profile.country || "",
        added_interests: [],
        date_of_birth: profile.date_of_birth || "",
        emergency_contact: profile.emergency_contact || "",
        gender: profile?.gender || "male",
        home_address: profile.home_address || "",
        profile_picture_id: "",
        removed_interests: [],
      });
    }
  }, [profile]);

  const handleChange = (key: keyof EditProfilePayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      toast.error("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImages([result.assets[0].uri]);
    }
  };

  const uploadImage = async () => {
    if (images.length === 0) return null;
    setLoading(true);
    try {
      const file = {
        uri: images[0],
        name: images[0].split("/").pop() || "image.jpg",
        type: "image/jpeg",
      };
      const response = await useUploadService({ file });
      return response?.data?.[0]?.id || null;
    } catch (e) {
      toast.error("Image upload failed. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      handleChange("date_of_birth", formattedDate);
      dateBottomSheetRef.current?.dismiss();
    }
  };

  const handleGenderSelect = (gender: string) => {
    handleChange("gender", gender);
    genderBottomSheetRef.current?.dismiss();
  };

  const handleCountrySelect = (country: string) => {
    handleChange("country", country);
    countryBottomSheetRef.current?.dismiss();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Select date of birth";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateForm = (): boolean => {
    if (!form.first_name.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!form.last_name.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!form.username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (form.bio.length > 120) {
      toast.error("Bio must be 120 characters or less");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      let profilePictureId = form.profile_picture_id;
      if (images.length > 0) {
        const uploadedId = await uploadImage();
        if (uploadedId) {
          profilePictureId = uploadedId;
        } else {
          setSaving(false);
          return;
        }
      }

      const result = await useUpdateAccountDetails({
        data: { ...form, profile_picture_id: profilePictureId },
      });

      if (result && !result.error) {
        // Fetch fresh profile data from server
        try {
          const freshProfile = await useGetProfile();
          if (freshProfile?.data) {
            setUser(freshProfile.data);
          }
        } catch (err) {
          console.log("Failed to refresh profile:", err);
        }

        toast.success("Profile updated successfully!");
        setSaving(false);
        router.back();
      } else {
        setSaving(false);
        const errorMessage = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message || "Failed to update profile. Please try again.";
        toast.error(errorMessage);
      }
    } catch (err: any) {
      setSaving(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const profileImageSource =
    images.length > 0
      ? { uri: images[0] }
      : profile?.profile_picture?.url
      ? { uri: generateURL({ url: profile.profile_picture.url }) }
      : require("@/assets/user.png");

  // Common countries list
  const countries = [
    "Nigeria",
    "Ghana",
    "Kenya",
    "South Africa",
    "United States",
    "United Kingdom",
    "Canada",
    "Other",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ThemedView
            flexDirection="row"
            alignItems="center"
            paddingHorizontal={20}
            paddingTop={10}
            marginBottom={20}
          >
            <BackButton />
            <ThemedText
              fontSize={22}
              fontWeight="bold"
              marginLeft={15}
              flex={1}
            >
              Edit Profile
            </ThemedText>
          </ThemedView>

          {/* Profile Picture Section */}
          <ThemedView
            backgroundColor="#fff"
            marginHorizontal={20}
            borderRadius={20}
            padding={24}
            marginBottom={20}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            elevation={2}
            alignItems="center"
          >
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarWrapper}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.avatar}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <Image source={profileImageSource} style={styles.avatar} />
              )}
              <View style={styles.cameraIcon}>
                <Camera size={20} color="#fff" variant="Bold" />
              </View>
            </TouchableOpacity>
            <ThemedText fontSize={14} color="#6B7280" marginTop={12}>
              Tap to change profile picture
            </ThemedText>
          </ThemedView>

          {/* Personal Information Section */}
          <ThemedView
            backgroundColor="#fff"
            marginHorizontal={20}
            borderRadius={20}
            padding={20}
            marginBottom={20}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            elevation={2}
          >
            <ThemedView
              flexDirection="row"
              alignItems="center"
              marginBottom={20}
            >
              <User size={20} color={COLORS.primary} variant="Bold" />
              <ThemedText
                fontSize={18}
                fontWeight="600"
                marginLeft={10}
                color="#111"
              >
                Personal Information
              </ThemedText>
            </ThemedView>

            <InputField
              label="First Name"
              icon={<User size={20} color={COLORS.primary} />}
              placeholder="Enter your first name"
              value={form.first_name}
              onChangeText={(v) => handleChange("first_name", v)}
            />
            <InputField
              label="Last Name"
              icon={<User size={20} color={COLORS.primary} />}
              placeholder="Enter your last name"
              value={form.last_name}
              onChangeText={(v) => handleChange("last_name", v)}
            />
            <InputField
              label="Username"
              icon={<ProfileCircle size={20} color={COLORS.primary} />}
              placeholder="Enter your username"
              value={form.username}
              onChangeText={(v) => handleChange("username", v)}
              autoCapitalize="none"
            />

            {/* Bio with character counter */}
            <ThemedView marginTop={20}>
              <ThemedView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom={5}
              >
                <ThemedText fontSize={14} color="#6B7280">
                  Bio
                </ThemedText>
                <ThemedText
                  fontSize={12}
                  color={form.bio.length > 120 ? "#EF4444" : "#6B7280"}
                >
                  {form.bio.length}/120
                </ThemedText>
              </ThemedView>
              <TextInput
                style={[
                  styles.bioInput,
                  {
                    borderColor:
                      form.bio.length > 120 ? "#EF4444" : "#E5E7EB",
                  },
                ]}
                placeholder="Tell us about yourself"
                placeholderTextColor="#9CA3AF"
                value={form.bio}
                onChangeText={(v) => handleChange("bio", v)}
                multiline
                numberOfLines={4}
                maxLength={120}
              />
            </ThemedView>
          </ThemedView>

          {/* Contact Information Section */}
          <ThemedView
            backgroundColor="#fff"
            marginHorizontal={20}
            borderRadius={20}
            padding={20}
            marginBottom={20}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            elevation={2}
          >
            <ThemedView
              flexDirection="row"
              alignItems="center"
              marginBottom={20}
            >
              <Call size={20} color={COLORS.primary} variant="Bold" />
              <ThemedText
                fontSize={18}
                fontWeight="600"
                marginLeft={10}
                color="#111"
              >
                Contact Information
              </ThemedText>
            </ThemedView>

            <InputField
              label="Phone Number"
              icon={<Call size={20} color={COLORS.primary} />}
              placeholder="Enter your phone number"
              value={form.phone_number}
              onChangeText={(v) => handleChange("phone_number", v)}
              keyboardType="phone-pad"
            />
            <InputField
              label="Emergency Contact"
              icon={<Call size={20} color={COLORS.primary} />}
              placeholder="Enter emergency contact"
              value={form.emergency_contact}
              onChangeText={(v) => handleChange("emergency_contact", v)}
              keyboardType="phone-pad"
            />
          </ThemedView>

          {/* Additional Information Section */}
          <ThemedView
            backgroundColor="#fff"
            marginHorizontal={20}
            borderRadius={20}
            padding={20}
            marginBottom={20}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            elevation={2}
          >
            <ThemedView
              flexDirection="row"
              alignItems="center"
              marginBottom={20}
            >
              <DocumentText size={20} color={COLORS.primary} variant="Bold" />
              <ThemedText
                fontSize={18}
                fontWeight="600"
                marginLeft={10}
                color="#111"
              >
                Additional Information
              </ThemedText>
            </ThemedView>

            {/* Gender Selector */}
            <ThemedView marginTop={10}>
              <ThemedText fontSize={14} color="#6B7280" marginBottom={8}>
                Gender
              </ThemedText>
              <TouchableOpacity
                onPress={() => genderBottomSheetRef.current?.present()}
                style={styles.selectButton}
              >
                <ThemedText
                  fontSize={15}
                  color={form.gender ? "#111" : "#9CA3AF"}
                  textTransform="capitalize"
                >
                  {form.gender || "Select gender"}
                </ThemedText>
                <Edit2 size={18} color="#6B7280" />
              </TouchableOpacity>
            </ThemedView>

            {/* Date of Birth */}
            <ThemedView marginTop={20}>
              <ThemedText fontSize={14} color="#6B7280" marginBottom={8}>
                Date of Birth
              </ThemedText>
              <TouchableOpacity
                onPress={() => dateBottomSheetRef.current?.present()}
                style={styles.selectButton}
              >
                <ThemedText
                  fontSize={15}
                  color={form.date_of_birth ? "#111" : "#9CA3AF"}
                >
                  {formatDate(form.date_of_birth)}
                </ThemedText>
                <Calendar size={18} color="#6B7280" />
              </TouchableOpacity>
            </ThemedView>

            {/* Country Selector */}
            <ThemedView marginTop={20}>
              <ThemedText fontSize={14} color="#6B7280" marginBottom={8}>
                Country
              </ThemedText>
              <TouchableOpacity
                onPress={() => countryBottomSheetRef.current?.present()}
                style={styles.selectButton}
              >
                <ThemedText
                  fontSize={15}
                  color={form.country ? "#111" : "#9CA3AF"}
                >
                  {form.country || "Select country"}
                </ThemedText>
                <Location size={18} color="#6B7280" />
              </TouchableOpacity>
            </ThemedView>

            {/* Home Address */}
            <ThemedView marginTop={20}>
              <InputField
                label="Home Address"
                icon={<Location size={20} color={COLORS.primary} />}
                placeholder="Enter your home address"
                value={form.home_address}
                onChangeText={(v) => handleChange("home_address", v)}
              />
            </ThemedView>
          </ThemedView>

          {/* Action Buttons */}
          <ThemedView
            flexDirection="row"
            gap={12}
            marginHorizontal={20}
            marginTop={10}
          >
            <NativeButton
              mode="outline"
              text="Cancel"
              style={{ flex: 1, borderRadius: 16, paddingVertical: 16 }}
              onPress={() => router.back()}
              disabled={saving || loading}
            />
            <NativeButton
              mode="fill"
              text={saving ? "Saving..." : "Save Changes"}
              style={{ flex: 1, borderRadius: 16, paddingVertical: 16 }}
              isLoading={saving || loading}
              onPress={handleSave}
              disabled={saving || loading}
            />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Bottom Sheet */}
      <BottomSheetModal
        ref={genderBottomSheetRef}
        index={0}
        snapPoints={genderSnapPoints}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <ThemedText fontSize={18} fontWeight="600" marginBottom={20}>
            Select Gender
          </ThemedText>
          <TouchableOpacity
            onPress={() => handleGenderSelect("male")}
            style={[
              styles.genderOption,
              form.gender === "male" && styles.genderOptionSelected,
            ]}
          >
            <ThemedText
              fontSize={16}
              color={form.gender === "male" ? COLORS.primary : "#111"}
              fontWeight={form.gender === "male" ? "600" : "400"}
            >
              Male
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleGenderSelect("female")}
            style={[
              styles.genderOption,
              form.gender === "female" && styles.genderOptionSelected,
            ]}
          >
            <ThemedText
              fontSize={16}
              color={form.gender === "female" ? COLORS.primary : "#111"}
              fontWeight={form.gender === "female" ? "600" : "400"}
            >
              Female
            </ThemedText>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Date of Birth Bottom Sheet */}
      <BottomSheetModal
        ref={dateBottomSheetRef}
        index={0}
        snapPoints={dateSnapPoints}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <ThemedText fontSize={18} fontWeight="600" marginBottom={20}>
            Select Date of Birth
          </ThemedText>
          <DateTimePicker
            value={
              form.date_of_birth
                ? new Date(form.date_of_birth)
                : new Date(2000, 0, 1)
            }
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            style={{ alignSelf: "center" }}
          />
          <NativeButton
            text="Confirm"
            mode="fill"
            style={{ borderRadius: 16, marginTop: 20 }}
            onPress={() => dateBottomSheetRef.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Country Bottom Sheet */}
      <BottomSheetModal
        ref={countryBottomSheetRef}
        index={0}
        snapPoints={countrySnapPoints}
        enablePanDownToClose
        backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <ThemedText fontSize={18} fontWeight="600" marginBottom={20}>
            Select Country
          </ThemedText>
          <ScrollView>
            {countries.map((country) => (
              <TouchableOpacity
                key={country}
                onPress={() => handleCountrySelect(country)}
                style={[
                  styles.countryOption,
                  form.country === country && styles.countryOptionSelected,
                ]}
              >
                <ThemedText
                  fontSize={16}
                  color={form.country === country ? COLORS.primary : "#111"}
                  fontWeight={form.country === country ? "600" : "400"}
                >
                  {country}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default EditAccount;

const styles = StyleSheet.create({
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: "#fff",
  },
  bioInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#FAFBFC",
    minHeight: 100,
    textAlignVertical: "top",
    fontFamily: "Quicksand_500Medium",
    color: "#111",
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FAFBFC",
  },
  genderOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#FAFBFC",
  },
  genderOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  countryOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#FAFBFC",
  },
  countryOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
});
