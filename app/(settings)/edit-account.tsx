import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import InputField from "@/components/common/input-field";
import { COLORS } from "@/config/theme";
import { useRouter } from "expo-router";
import { Camera, User, ProfileCircle, Call } from "iconsax-react-native";
import { EditProfilePayload, UserProfileR } from "@/types/auth.types";
import { updateProfileService } from "@/services/account-service.service";
import { useGetProfile, useUploadService } from "@/hooks/auth-hooks.hooks";
import toast from "@originaltimi/rn-toast";
import * as ImagePicker from "expo-image-picker";
import { generateURL } from "@/utils/image-utils.utils";
import { useUpdateAccountDetails } from "@/hooks/account-hooks.hooks";

const EditAccount = () => {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]); // local preview URIs
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setUser] = useState<UserProfileR>(null!);

  const fetchMe = async () => {
    const response = await useGetProfile();
    console.log(response);
    setUser(response?.data);
  };

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
      gender : profile?.gender || "",
      home_address: profile.home_address || "",
      profile_picture_id: "",
      removed_interests: [],
    });
  }
}, [profile]);


  useEffect(() => {
    fetchMe();
    console.log("SJSJ");
  }, []);

  const [form, setForm] = useState<EditProfilePayload>({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    username: profile?.username || "",
    bio:  profile?.bio || "",
    phone_number: profile?.phone_number || "",
    country: profile?.country || "",
    added_interests: [],
    date_of_birth: "",
    emergency_contact: profile?.emergency_contact || "",
    gender: "male",
    home_address: "",
    profile_picture_id: "",
    removed_interests: [],
  });

  const handleChange = (key: keyof EditProfilePayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      toast({
        title: "Permission to access gallery is required!",
        type: "error",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: false,
      quality: 0.7,
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
      toast({ title: "Image upload failed.", type: "error" });
      return null;
    } finally {
      setLoading(false);
    }
  };

 const handleSave = async () => {
  try {
    setSaving(true);

    let profilePictureId = form.profile_picture_id;
    if (images.length > 0) {
      const uploadedId = await uploadImage();
      if (uploadedId) {
        profilePictureId = uploadedId;
      }
    }

    const result = await useUpdateAccountDetails({
      data: { ...form, profile_picture_id: profilePictureId },
    });

    setSaving(false);

    console.log(result, "REYEYEYEY");

    if (result && !result.error) {
      Alert.alert("Success", "Account updated successfully!");
    } else {
      // Handle array or string error messages from API
      const errorMessage =
        Array.isArray(result?.message)
          ? result.message.join("\n")
          : result?.message || "Failed to update account.";
      Alert.alert("Error", errorMessage);
    }
  } catch (err) {
    setSaving(false);
    Alert.alert("Error", "Something went wrong.");
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          fontSize={24}
          weight="medium"
          textAlign="center"
          marginBottom={20}
        >
          Edit Account
        </ThemedText>

        {/* Profile Picture */}
        <ThemedView alignItems="center" marginBottom={30}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            <Image
              source={
                images.length > 0
                  ? { uri: images[0] }
                  : form.profile_picture_id
                  ? { uri: `https://your-cdn.com/${form.profile_picture_id}` }
                  : {uri : generateURL({url : profile?.profile_picture?.url})}
              }
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <Camera size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          <ThemedText fontSize={13} color="#888" marginTop={8}>
            Tap to change profile picture
          </ThemedText>
        </ThemedView>

        <ThemedView>
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
          <ThemedText
            fontSize={15}
            weight="medium"
            marginBottom={5}
            marginTop={18}
          >
            Bio
          </ThemedText>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: "top" }]}
            placeholder="Tell us about yourself"
            value={form.bio}
            onChangeText={(v) => handleChange("bio", v)}
            multiline
            numberOfLines={3}
            maxLength={120}
          />
          <ThemedView marginTop={20}>
            <InputField
              label="Phone Number"
              icon={<Call size={20} color={COLORS.primary} />}
              placeholder="Enter your phone number"
              value={form.phone_number}
              onChangeText={(v) => handleChange("phone_number", v)}
              keyboardType="phone-pad"
            />
          </ThemedView>
          <ThemedView marginTop={20}>
            <InputField
              label="Emergency Contact"
              icon={<Call size={20} color={COLORS.primary} />}
              placeholder="Enter emergency contact"
              value={form.emergency_contact}
              onChangeText={(v) => handleChange("emergency_contact", v)}
              keyboardType="phone-pad"
            />
          </ThemedView>
        </ThemedView>

        {/* Buttons */}
        <ThemedView flexDirection="row" gap={15} marginTop={30}>
          <NativeButton
            mode="outline"
            text="Cancel"
            style={{ flex: 1, borderRadius: 200 }}
            onPress={() => router.back()}
          />
          <NativeButton
            mode="fill"
            text={saving ? "Saving..." : "Save"}
            style={{ flex: 1, borderRadius: 200 }}
            isLoading={saving || loading}
            onPress={handleSave}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditAccount;

const styles = StyleSheet.create({
  avatarWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 100,
    overflow: "hidden",
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#fafbfc",
    marginBottom: 2,
  },
});
