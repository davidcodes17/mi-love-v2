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
import {
  useRetryUploadJob,
  useUploadService,
  useWaitForUploadJob,
} from "@/hooks/auth-hooks.hooks";
import { useCreatePost } from "@/hooks/post-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import { useUserStore } from "@/store/store";
import BackButton from "@/components/common/back-button";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 60) / 3; // 3 images per row with padding
const MAX_FILES = 5;
const MAX_FILE_SIZE = 80 * 1024 * 1024;

type MediaItem = {
  key: string;
  uri: string;
  name: string;
  type: string;
  fileSize?: number;
  status: "pending" | "uploading" | "processing" | "uploaded" | "failed";
  progress: number;
  fileId?: string;
  jobId?: string;
  error?: string;
};

export default function Page() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "friends">("public");

  const { user } = useUserStore();
  const maxContentLength = 500;
  const remainingChars = maxContentLength - content.length;

  const pickImage = async () => {
    try {
      // Check if permission is already granted
      const permissionStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

      let finalStatus = permissionStatus.status;

      // Request permission if not granted
      if (finalStatus !== "granted") {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = permissionResult.status;
      }

      // Handle permission denial
      if (finalStatus !== "granted") {
        toast.error("Permission to access gallery is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const available = MAX_FILES - images.length;
        const accepted = result.assets.slice(0, available).filter((asset) => {
          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            toast.error(`${asset.fileName || "A file"} exceeds the 80MB limit.`);
            return false;
          }
          return true;
        });
        if (result.assets.length > available) {
          toast.error(`You can attach up to ${MAX_FILES} files.`);
        }
        setImages((prev) => [
          ...prev,
          ...accepted.map((asset, index) => ({
            key: `${asset.assetId || asset.uri}-${Date.now()}-${index}`,
            uri: asset.uri,
            name:
              asset.fileName ||
              asset.uri.split("/").pop() ||
              (asset.type === "video" ? "video.mp4" : "image.jpg"),
            type:
              asset.mimeType ||
              (asset.type === "video" ? "video/mp4" : "image/jpeg"),
            fileSize: asset.fileSize,
            status: "pending" as const,
            progress: 0,
          })),
        ]);
      }
    } catch (error) {
      toast.error("Error selecting image. Please try again.");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedia = (key: string, patch: Partial<MediaItem>) => {
    setImages((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  const uploadItem = async (item: MediaItem): Promise<string | null> => {
    updateMedia(item.key, {
      status: "uploading",
      progress: 0,
      error: undefined,
    });
    const response = await useUploadService({
      file: { uri: item.uri, name: item.name, type: item.type },
      onProgress: (progress) => updateMedia(item.key, { progress }),
    });
    const fileId = response?.data?.[0]?.id || response?.files?.[0]?.id;
    if (fileId) {
      updateMedia(item.key, { status: "uploaded", progress: 1, fileId });
      return fileId;
    }
    const jobId =
      response?.jobs?.[0]?.id ||
      response?.data?.jobs?.[0]?.id ||
      response?.job?.id;
    if (jobId) {
      updateMedia(item.key, { status: "processing", progress: 1, jobId });
      try {
        const processedId = await useWaitForUploadJob({ jobId });
        updateMedia(item.key, {
          status: "uploaded",
          fileId: processedId,
          error: undefined,
        });
        return processedId;
      } catch (error) {
        updateMedia(item.key, {
          status: "failed",
          error: error instanceof Error ? error.message : "Processing failed",
        });
        return null;
      }
    }
    updateMedia(item.key, {
      status: "failed",
      error: response?.message || response?.error || "Upload failed",
    });
    return null;
  };

  const retryItem = async (item: MediaItem) => {
    if (uploading) return;
    setUploading(true);
    try {
      if (item.jobId) {
        updateMedia(item.key, { status: "processing", error: undefined });
        const retry = await useRetryUploadJob({ jobId: item.jobId });
        if (retry?.error) throw new Error(retry.error);
        const nextJobId =
          retry?.data?.id || retry?.job?.id || retry?.jobs?.[0]?.id || item.jobId;
        updateMedia(item.key, { jobId: nextJobId });
        const fileId = await useWaitForUploadJob({ jobId: nextJobId });
        updateMedia(item.key, { status: "uploaded", fileId, error: undefined });
      } else {
        await uploadItem(item);
      }
    } catch (error) {
      updateMedia(item.key, {
        status: "failed",
        error: error instanceof Error ? error.message : "Retry failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadImages = async () => {
    setUploading(true);
    try {
      const ids: string[] = [];
      for (const item of images) {
        if (item.fileId) {
          ids.push(item.fileId);
          continue;
        }
        const id = await uploadItem(item);
        if (id) ids.push(id);
      }
      return ids;
    } catch (e) {
      toast.error("Media upload failed.");
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Add a caption or at least one photo/video.");
      return;
    }

    if (content.length > maxContentLength) {
      toast.error(`Content exceeds ${maxContentLength} characters.`);
      return;
    }

    setLoading(true);
    let ids = images.map((item) => item.fileId).filter(Boolean) as string[];

    try {
      if (images.length && ids.length !== images.length) {
        ids = await uploadImages();
      }
      if (ids.length !== images.length) {
        toast.error("Some files failed to upload. Retry or remove them before posting.");
        return;
      }

      const response = await useCreatePost({
        data: {
          visibility,
          content: content.trim(),
          files: ids,
        },
      });

      if (response?.data?.id) {
        toast.success(
          `Post created successfully! 🎉 Your post has been published.`
        );

        setContent("");
        setImages([]);

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
          disabled={loading || uploading || (!content.trim() && images.length === 0)}
          style={{
            opacity:
              loading || uploading || (!content.trim() && images.length === 0)
                ? 0.5
                : 1,
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
            onError={() => { }}
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

        {/* Visibility */}
        <ThemedView marginBottom={20}>
          <ThemedText weight="bold" fontSize={16} marginBottom={12}>
            Who can see this?
          </ThemedText>
          <ThemedView flexDirection="row" gap={10}>
            {(["public", "friends"] as const).map((option) => {
              const active = visibility === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setVisibility(option)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? COLORS.primary : "#e5e5e5",
                    backgroundColor: active ? "rgba(212,19,114,0.08)" : "#fff",
                    alignItems: "center",
                  }}
                >
                  <ThemedText
                    weight="bold"
                    color={active ? COLORS.primary : "#666"}
                  >
                    {option === "public" ? "Everyone" : "Friends only"}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
        </ThemedView>

        {/* Images Section */}
        {images.length > 0 && (
          <ThemedView marginBottom={20}>
            <ThemedText weight="bold" fontSize={16} marginBottom={12}>
              Selected media ({images.length}/{MAX_FILES})
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {images.map((item, index) => (
                <View key={item.key} style={{ position: "relative" }}>
                  <Image
                    source={{ uri: item.uri }}
                    style={{
                      width: IMAGE_SIZE,
                      height: IMAGE_SIZE,
                      borderRadius: 12,
                      backgroundColor: "#f0f0f0",
                    }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      left: 4,
                      right: 4,
                      bottom: 4,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      borderRadius: 6,
                      padding: 4,
                    }}
                  >
                    <ThemedText color="#fff" fontSize={10}>
                      {item.status === "uploading"
                        ? `Uploading ${Math.round(item.progress * 100)}%`
                        : item.status === "processing"
                          ? "Processing video…"
                          : item.status}
                    </ThemedText>
                    {item.status === "failed" && (
                      <TouchableOpacity onPress={() => retryItem(item)}>
                        <ThemedText color="#60a5fa" fontSize={10} weight="bold">
                          Retry
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
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
          disabled={uploading || images.length >= MAX_FILES}
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
              Add up to 5 images or videos. Files with a known size must be
              80MB or smaller.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
