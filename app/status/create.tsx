import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "expo-av";
import { router } from "expo-router";
import { ThemedText } from "@/components/ui/themed-view";
import {
  useRetryUploadJob,
  useUploadService,
  useWaitForUploadJob,
} from "@/hooks/auth-hooks.hooks";
import { useCreateStatus } from "@/hooks/status-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";

export default function CreateStatusScreen() {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<{
    uri: string;
    name: string;
    type: string;
    fileSize?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      toast.error("Gallery permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      allowsEditing: false,
      aspect: [9, 16],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 80 * 1024 * 1024) {
        toast.error("Story media must be 80MB or smaller");
        return;
      }
      setMedia({
        uri: asset.uri,
        name:
          asset.fileName ||
          asset.uri.split("/").pop() ||
          (asset.type === "video" ? "story.mp4" : "story.jpg"),
        type:
          asset.mimeType ||
          (asset.type === "video" ? "video/mp4" : "image/jpeg"),
        fileSize: asset.fileSize,
      });
      setJobId(null);
      setUploadError(null);
    }
  };

  const uploadMedia = async () => {
    if (!media) return undefined;
    setUploadError(null);
    const uploadRes = await useUploadService({ file: media });
    const syncId = uploadRes?.data?.[0]?.id || uploadRes?.files?.[0]?.id;
    if (syncId) return syncId as string;
    const nextJobId =
      uploadRes?.jobs?.[0]?.id ||
      uploadRes?.data?.jobs?.[0]?.id ||
      uploadRes?.job?.id;
    if (!nextJobId) {
      throw new Error(uploadRes?.message || uploadRes?.error || "Upload failed");
    }
    setJobId(nextJobId);
    return useWaitForUploadJob({ jobId: nextJobId });
  };

  const retryProcessing = async () => {
    if (!jobId || loading) return;
    setLoading(true);
    setUploadError(null);
    try {
      const res = await useRetryUploadJob({ jobId });
      if (res?.error) throw new Error(res.error);
      const nextJobId =
        res?.data?.id || res?.job?.id || res?.jobs?.[0]?.id || jobId;
      setJobId(nextJobId);
      const fileId = await useWaitForUploadJob({ jobId: nextJobId });
      await submit(true, fileId);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Retry failed");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (fromRetry = false, readyFileId?: string) => {
    if (!content.trim() && !media) {
      toast.error("Add text, a photo, or a video for your story");
      return;
    }

    setLoading(true);
    try {
      let fileId: string | undefined = readyFileId;

      if (media && !fileId) {
        fileId = await uploadMedia();
        if (!fileId) throw new Error("Upload completed without a file");
      }

      const res = await useCreateStatus({
        data: {
          content: content.trim() || undefined,
          fileId,
        },
      });

      if (res?.error || (typeof res === "string" && res.includes("error"))) {
        toast.error("Could not create story");
        return;
      }

      toast.success("Story posted — disappears in 24 hours");
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not create story";
      setUploadError(message);
      if (!fromRetry) toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>New story</ThemedText>
        <TouchableOpacity onPress={() => submit()} disabled={loading} hitSlop={10}>
          {loading ? (
            <ActivityIndicator color="#0095f6" />
          ) : (
            <ThemedText style={styles.share}>Share</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {media ? (
          media.type.startsWith("video/") ? (
            <Video
              source={{ uri: media.uri }}
              style={styles.preview}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          ) : (
            <Image source={{ uri: media.uri }} style={styles.preview} />
          )
        ) : (
          <View style={styles.placeholder}>
            <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={32} color="#fff" />
              <ThemedText style={styles.pickText}>Add photo</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Type something..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={300}
        />
      </View>

      {media && (
        <View style={styles.changePhoto}>
          {!!uploadError && (
            <ThemedText style={styles.uploadError}>{uploadError}</ThemedText>
          )}
          {!!jobId && !!uploadError && (
            <TouchableOpacity onPress={retryProcessing}>
              <ThemedText style={styles.retryText}>Retry processing</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={pickImage}>
            <ThemedText style={styles.changePhotoText}>Change media</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  share: {
    color: "#0095f6",
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  preview: {
    width: "100%",
    aspectRatio: 9 / 16,
    maxHeight: "70%",
    borderRadius: 12,
    alignSelf: "center",
  },
  placeholder: {
    height: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  pickBtn: {
    alignItems: "center",
    gap: 8,
  },
  pickText: {
    color: "#fff",
    fontSize: 14,
  },
  input: {
    marginTop: 20,
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    minHeight: 60,
  },
  changePhoto: {
    alignItems: "center",
    paddingBottom: 24,
  },
  changePhotoText: {
    color: "#0095f6",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadError: { color: "#ff6b6b", fontSize: 12, marginBottom: 6 },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
});
