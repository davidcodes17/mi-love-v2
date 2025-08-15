import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Camera, Gallery, ColorSwatch } from "iconsax-react-native";

import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import { COLORS } from "@/config/theme";
import { useCreateStatus } from "@/hooks/status-hooks,hooks";
import { CreateStatusPayload } from "@/types/status.types";

const backgroundColors = [
  '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', 
  '#00B894', '#00CEC9', '#E17055', '#81ECEC', 
  '#74B9FF', '#FF7675', '#2D3436', '#636E72',
];

const CreateStatusScreen = () => {
  const [content, setContent] = useState('');
  const [selectedBackground, setSelectedBackground] = useState(COLORS.primary);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateStatus = async () => {
    if (!content.trim() && !mediaUri) {
      Alert.alert('Error', 'Please add some content or select an image for your story.');
      return;
    }

    setLoading(true);
    try {
      const statusData: CreateStatusPayload = {
        content: content.trim(),
        backgroundColor: mediaUri ? undefined : selectedBackground,
        textColor: mediaUri ? undefined : '#fff',
        mediaUrl: mediaUri || undefined,
        mediaType: mediaUri ? 'image' : undefined,
      };

      const response = await useCreateStatus({ data: statusData });
      if (response?.message) {
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create status. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create status:', error);
      Alert.alert('Error', 'Failed to create status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectImage = () => {
    // This would typically open image picker
    Alert.alert(
      'Select Image',
      'Image picker functionality would be implemented here with expo-image-picker',
      [
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeImage = () => {
    setMediaUri(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView flex={1}>
        {/* Header */}
        <ThemedView 
          flexDirection="row" 
          alignItems="center" 
          justifyContent="space-between"
          paddingHorizontal={20}
          paddingVertical={12}
          backgroundColor="#fff"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color="#000" />
          </TouchableOpacity>
          <ThemedText fontSize={18} fontWeight="600" color="#000">
            Create Story
          </ThemedText>
          <TouchableOpacity onPress={selectImage}>
            <Gallery size={22} color="#000" />
          </TouchableOpacity>
        </ThemedView>

        {/* Preview */}
        <ThemedView flex={1} margin={20} borderRadius={16} overflow="hidden">
          {mediaUri ? (
            <ThemedView flex={1} position="relative">
              <Image source={{ uri: mediaUri }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <ThemedText color="#fff" fontSize={14} fontWeight="600">✕</ThemedText>
              </TouchableOpacity>
              {content.trim() && (
                <ThemedView 
                  position="absolute"
                  bottom={16}
                  left={16}
                  right={16}
                  backgroundColor="rgba(0,0,0,0.7)"
                  borderRadius={12}
                  padding={12}
                >
                  <ThemedText 
                    color="#fff"
                    fontSize={16}
                    fontWeight="500"
                    textAlign="center"
                    lineHeight={22}
                  >
                    {content}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          ) : (
            <ThemedView 
              flex={1} 
              backgroundColor={selectedBackground}
              justifyContent="center"
              alignItems="center"
              padding={20}
            >
              <TextInput
                style={[
                  styles.textInput,
                  { color: '#fff' }
                ]}
                placeholder="What's on your mind?"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={content}
                onChangeText={setContent}
                multiline
                textAlign="center"
                maxLength={50}
              />
            </ThemedView>
          )}
        </ThemedView>

        {/* Controls */}
        <ThemedView 
          backgroundColor="#fff" 
          paddingHorizontal={20} 
          paddingBottom={20}
        >
          {!mediaUri && (
            <ThemedView marginBottom={20}>
              <ThemedText 
                fontSize={14}
                fontWeight="600" 
                marginBottom={12}
                color="#000"
              >
                Background Color
              </ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorContainer}
              >
                {backgroundColors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedBackground === color && styles.selectedColor
                    ]}
                    onPress={() => setSelectedBackground(color)}
                  />
                ))}
              </ScrollView>
            </ThemedView>
          )}

          {/* Character Count */}
          <ThemedView alignItems="center" marginBottom={16}>
            <ThemedText 
              fontSize={12}
              color="#999"
            >
              {content.length}/50 characters
            </ThemedText>
          </ThemedView>

          {/* Create Button */}
          <NativeButton
            mode="fill"
            text={loading ? "Creating..." : "Share Story"}
            onPress={handleCreateStatus}
            isLoading={loading}
            disabled={loading}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    fontSize: 18,
    fontFamily:"Quicksand_500Medium",
    textAlign: 'center',
    width: '100%',
    minHeight: 120,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  colorContainer: {
    paddingRight: 20,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
});

export default CreateStatusScreen;
