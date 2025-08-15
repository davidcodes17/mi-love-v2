import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { Status } from "@/types/status.types";

interface StatusPlaceholderProps {
  status?: Status;
}

const StatusPlaceholder = ({ status }: StatusPlaceholderProps) => {
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '23 hours ago';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const imageUrl = status?.mediaUrl || status?.user?.profileImage || 
    "https://www.shutterstock.com/image-photo/happy-beautiful-african-girl-afro-600nw-1810651855.jpg";
  
  const userImageUrl = status?.user?.profileImage || 
    "https://www.shutterstock.com/image-photo/happy-beautiful-african-girl-afro-600nw-1810651855.jpg";

  return (
    <ThemedView position="relative" marginRight={10}>
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: 120,
          height: 150,
          borderRadius: 10,
        }}
        resizeMode="cover"
      />
      <ThemedView
        backgroundColor={"rgba(0, 0, 0, 0.5)"}
        position="absolute"
        top={0}
        left={0}
        width={120}
        height={150}
        borderRadius={10}
        padding={10}
      >
        <ThemedView justifyContent="space-between" flex={1}>
          <ThemedView>
            {!status?.isViewed && (
              <ThemedText
                backgroundColor={COLORS.primary}
                color={"#fff"}
                alignSelf="flex-start"
                padding={5}
                paddingHorizontal={5}
                borderRadius={5}
                fontSize={10}
                weight="semibold"
              >
                NEW
              </ThemedText>
            )}
          </ThemedView>
          <ThemedView>
            <Image
              source={{ uri: userImageUrl }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
              }}
              resizeMode="cover"
            />
            <ThemedText color={"#fff"} paddingTop={2} fontSize={12} weight="medium">
              {getTimeAgo(status?.createdAt)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default StatusPlaceholder;
