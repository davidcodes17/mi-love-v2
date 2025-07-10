import globalStyles from "@/components/styles/global-styles";
import NativeButton from "@/components/ui/native-button";
import NativeText from "@/components/ui/native-text";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { AddSquare } from "iconsax-react-native";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { useGetProfile, useUploadService } from "@/hooks/auth-hooks.hooks";
import { useCreatePost } from "@/hooks/post-hooks.hooks";
import toast from "@originaltimi/rn-toast";
import { UserProfileR } from "@/types/auth.types";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";

export default function Page() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]); // local URIs
  const [fileIds, setFileIds] = useState<string[]>([]); // uploaded file IDs
  const [loading, setLoading] = useState(false);

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
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const uploadImages = async () => {
    setLoading(true);
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
      toast({ title: "Image upload failed.", type: "error" });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast({ 
        title: "Post content cannot be empty. Please write something before posting.",
        type: "error" 
      });
      return;
    }
    
    if (images.length === 0) {
      toast({ 
        title: "No images selected. Please add at least one image to your post.",
        type: "error" 
      });
      return;
    }

    setLoading(true);
    let ids = fileIds;
    
    try {
      if (images.length && fileIds.length !== images.length) {
        toast({ 
          title: `Uploading ${images.length} image${images.length > 1 ? 's' : ''}...`,
          type: "info" 
        });
        ids = await uploadImages();
      }

      toast({ 
        title: "Creating post... Please wait while we publish your post.",
        type: "info" 
      });

      const response = await useCreatePost({
        data: {
          visibility: "public",
          content,
          files: ids,
        },
      });

      if (response?.id) {
        toast({ 
          title: `Post created successfully! 🎉 Your post "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}" has been published with ${images.length} image${images.length > 1 ? 's' : ''}.`,
          type: "success",
          duration: 4000
        });
        
        // Reset form
        setContent("");
        setImages([]);
        setFileIds([]);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/(home)/home");
        }, 1500);
      } else {
        toast({
          title: `Failed to create post: ${response?.message || "Something went wrong. Please try again."}`,
          type: "error",
          duration: 4000
        });
      }
    } catch (e) {
      toast({ 
        title: "Post creation failed: Network error or server issue. Please check your connection and try again.",
        type: "error",
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const [user, setUser] = useState<UserProfileR>(null!);

  const fetchMe = async () => {
    const response = await useGetProfile();
    console.log(response);
    setUser(response?.data);
  };

  useEffect(() => {
    fetchMe();
    console.log("SJSJ");
  }, []);

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ScrollView>
        <ThemedView padding={20}>
          <ThemedText textAlign="center" fontSize={20} weight="medium">
            Create Post
          </ThemedText>

          <ThemedView marginTop={20}>
            <ThemedView flexDirection="row" justifyContent="space-between">
              <ThemedView flexDirection="row" gap={10} alignItems="center">
                <Image
                  source={{
                    uri: generateURL({ url: user?.profile_picture?.url }),
                  }}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 100,
                  }}
                />
                <ThemedView>
                  <ThemedText weight="bold">{user?.username}</ThemedText>
                  <ThemedText>{`${user?.first_name} ${user?.last_name}`}</ThemedText>
                </ThemedView>
              </ThemedView>
              <NativeButton
                mode="fill"
                text={loading ? "Posting..." : "Post"}
                style={{
                  paddingVertical: 2,
                  borderRadius: 200,
                  paddingHorizontal: 30,
                }}
                onPress={handlePost}
                isLoading={loading}
              />
            </ThemedView>

            <ThemedView marginTop={20}>
              <TextInput
                multiline={true}
                numberOfLines={3}
                placeholder="What's on your mind, areegbedavid?"
                style={{
                  fontFamily: "Quicksand_500Medium",
                  fontSize: 20,
                  padding: 10,
                  height: 200,
                }}
                scrollEnabled
                value={content}
                onChangeText={setContent}
              />
            </ThemedView>

            <ThemedView flexDirection="row" gap={10} alignItems="center">
              <ThemedView>
                <ScrollView horizontal>
                  {images.map((uri, idx) => (
                    <Image
                      key={uri + idx}
                      source={{ uri }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 20,
                        marginRight: 20,
                      }}
                    />
                  ))}
                </ScrollView>
              </ThemedView>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                <ThemedView
                  width={100}
                  height={100}
                  borderWidth={1.4}
                  borderColor={COLORS.primary}
                  borderRadius={20}
                  marginTop={10}
                  justifyContent="center"
                  flexDirection="row"
                  paddingTop={30}
                >
                  <AddSquare size={30} color={COLORS.primary} />
                </ThemedView>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
