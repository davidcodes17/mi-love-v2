import globalStyles from "@/components/styles/global-styles";
import NativeButton from "@/components/ui/native-button";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import {
  AddSquare,
  Gallery,
  CloseCircle,
  Image as ImageIcon,
} from "iconsax-react-native";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useUploadService } from "@/hooks/auth-hooks.hooks";
import { useCreatePost } from "@/hooks/post-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import { useUserStore } from "@/store/store";
import BackButton from "@/components/common/back-button";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 60) / 3; // 3 images per row with padding

export default function Page() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { user } = useUserStore();
  const maxContentLength = 500;
  const remainingChars = maxContentLength - content.length;

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      toast.error("Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // Also remove corresponding fileId if exists
    if (fileIds[index]) {
      setFileIds((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImages = async () => {
    setUploading(true);
    try {
      const ids: string[] = [];
      for (const uri of images) {
        const file = {
          uri,
          name: uri.split("/").pop() || "image.jpg",
          type: "image/jpeg",
        };
        const response = await useUploadService({ file });
        if (response?.data?.[0]?.id) {
          ids.push(response.data[0].id);
        }
      }
      setFileIds(ids);
      return ids;
    } catch (e) {
      toast.error("Image upload failed.");
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error(
        "Post content cannot be empty. Please write something before posting."
      );
      return;
    }

    if (content.length > maxContentLength) {
      toast.error(`Content exceeds ${maxContentLength} characters.`);
      return;
    }

    setLoading(true);
    let ids = fileIds;

    try {
      if (images.length && fileIds.length !== images.length) {
        setUploading(true);
        ids = await uploadImages();
        setUploading(false);
      }

      const response = await useCreatePost({
        data: {
          visibility: "public",
          content,
          files: ids,
        },
      });

      if (response?.data?.id) {
        toast.success(
          `Post created successfully! 🎉 Your post has been published.`
        );

        // Reset form
        setContent("");
        setImages([]);
        setFileIds([]);

        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/(home)/home");
        }, 1000);
      } else {
        toast.error(
          `Failed to create post: ${
            response?.message || "Something went wrong. Please try again."
          }`
        );
      }
    } catch (e) {
      toast.error(
        "Post creation failed: Network error or server issue. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <ThemedView
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        padding={20}
        paddingBottom={10}
        borderBottomWidth={1}
        borderBottomColor="#f0f0f0"
      >
        <ThemedText weight="bold" fontSize={18}>
          Create Post
        </ThemedText>
        <TouchableOpacity
          onPress={handlePost}
          disabled={loading || uploading || !content.trim()}
          style={{
            opacity: loading || uploading || !content.trim() ? 0.5 : 1,
          }}
        >
          <ThemedView
            backgroundColor={COLORS.primary}
            paddingHorizontal={20}
            paddingVertical={8}
            borderRadius={20}
          >
            {loading || uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText color="#fff" weight="bold" fontSize={14}>
                Post
              </ThemedText>
            )}
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <ThemedView
          flexDirection="row"
          alignItems="center"
          gap={12}
          marginBottom={20}
        >
          <Image
            source={
              user?.profile_picture?.url
                ? {
                    uri: generateURL({ url: user.profile_picture.url }),
                  }
                : require("@/assets/user.png")
            }
            defaultSource={require("@/assets/user.png")}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              borderWidth: 2,
              borderColor: COLORS.primary,
            }}
            onError={() => {}}
          />
          <ThemedView flex={1}>
            <ThemedText weight="bold" fontSize={16}>
              {user?.first_name} {user?.last_name}
            </ThemedText>
            <ThemedText fontSize={14} color="#666">
              @{user?.username}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Text Input Area */}
        <ThemedView
          backgroundColor="#f9f9f9"
          borderRadius={16}
          padding={16}
          marginBottom={20}
          minHeight={200}
        >
          <TextInput
            multiline
            placeholder={`What's on your mind, ${user?.first_name || "there"}?`}
            placeholderTextColor="#999"
            style={{
              fontFamily: "Quicksand_500Medium",
              fontSize: 16,
              lineHeight: 24,
              color: "#1a1a1a",
              minHeight: 180,
              textAlignVertical: "top",
            }}
            value={content}
            onChangeText={setContent}
            maxLength={maxContentLength}
          />
          <ThemedView
            flexDirection="row"
            justifyContent="flex-end"
            marginTop={10}
          >
            <ThemedText
              fontSize={12}
              color={remainingChars < 50 ? "#ef4444" : "#999"}
            >
              {remainingChars} characters remaining
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Images Section */}
        {images.length > 0 && (
          <ThemedView marginBottom={20}>
            <ThemedText weight="bold" fontSize={16} marginBottom={12}>
              Selected Images ({images.length})
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {images.map((uri, index) => (
                <View key={`${uri}-${index}`} style={{ position: "relative" }}>
                  <Image
                    source={{ uri }}
                    style={{
                      width: IMAGE_SIZE,
                      height: IMAGE_SIZE,
                      borderRadius: 12,
                      backgroundColor: "#f0f0f0",
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: "#fff",
                      borderRadius: 15,
                      padding: 2,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  >
                    <CloseCircle size={24} color="#ef4444" variant="Bold" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ThemedView>
        )}

        {/* Add Image Button */}
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.7}
          disabled={uploading}
        >
          <ThemedView
            backgroundColor="#f9f9f9"
            borderRadius={16}
            padding={20}
            borderWidth={2}
            borderColor={COLORS.primary}
            borderStyle="dashed"
            alignItems="center"
            justifyContent="center"
            minHeight={120}
            opacity={uploading ? 0.6 : 1}
          >
            {uploading ? (
              <ThemedView alignItems="center">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <ThemedText marginTop={10} color="#666" fontSize={14}>
                  Uploading images...
                </ThemedText>
              </ThemedView>
            ) : (
              <ThemedView alignItems="center">
                <ThemedView
                  backgroundColor={COLORS.primary}
                  width={60}
                  height={60}
                  borderRadius={30}
                  justifyContent="center"
                  alignItems="center"
                  marginBottom={12}
                >
                  <Gallery size={28} color="#fff" variant="Bold" />
                </ThemedView>
                <ThemedText weight="bold" fontSize={16} color={COLORS.primary}>
                  Add Photos
                </ThemedText>
                <ThemedText fontSize={12} color="#666" marginTop={4}>
                  Tap to select from gallery
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </TouchableOpacity>

        {/* Info Card */}
        <ThemedView
          backgroundColor="#EFF6FF"
          borderRadius={12}
          padding={16}
          marginTop={20}
          flexDirection="row"
          alignItems="center"
          gap={12}
        >
          <ImageIcon size={24} color={COLORS.primary} variant="Bold" />
          <ThemedView flex={1}>
            <ThemedText fontSize={13} color="#1e40af" weight="medium">
              Tips for a great post
            </ThemedText>
            <ThemedText fontSize={12} color="#3b82f6" marginTop={4}>
              Share your thoughts, experiences, or moments. You can add up to 9
              images to make your post more engaging!
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
