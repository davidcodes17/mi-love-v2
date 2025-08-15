import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Heart, Send2, More } from "iconsax-react-native";

import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS, TYPOGRAPHY } from "@/config/theme";
import { 
  useGetSingleStatus, 
  useViewStatus 
} from "@/hooks/status-hooks,hooks";
import { Status } from "@/types/status.types";
import { useUserProfileStore } from "@/hooks/auth-hooks.hooks";

const { width, height } = Dimensions.get('window');

const ViewStatusScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const profile = useUserProfileStore((state) => state.profile);
  
  // Progress animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressInterval = useRef<any>(null);

  useEffect(() => {
    if (id) {
      fetchStatus();
      markAsViewed();
      startProgressAnimation();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [id]);

  const fetchStatus = async () => {
    try {
      const response = await useGetSingleStatus({ id: id! });
      if (response?.data) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async () => {
    try {
      await useViewStatus({ id: id! });
    } catch (error) {
      console.error('Failed to mark status as viewed:', error);
    }
  };

  const startProgressAnimation = () => {
    progressInterval.current = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          if (prev >= 100) {
            router.back();
            return 0;
          }
          return prev + 1;
        });
      }
    }, 50); // 5 seconds total (100 * 50ms)
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView flex={1} justifyContent="center" alignItems="center">
          <ThemedText color="#fff">Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!status) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView flex={1} justifyContent="center" alignItems="center">
          <ThemedText color="#fff">Status not found</ThemedText>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backToHomeButton}
          >
            <ThemedText color={COLORS.primary}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ThemedView flex={1} width={width} height={height}>
        {/* Progress Bar */}
        <ThemedView position="absolute" top={50} left={20} right={20} zIndex={10}>
          <ThemedView 
            height={3} 
            backgroundColor="rgba(255,255,255,0.3)"
            borderRadius={2}
          >
            <ThemedView
              height={3}
              backgroundColor="#fff"
              borderRadius={2}
              width={`${progress}%`}
            />
          </ThemedView>
        </ThemedView>

        {/* Header */}
        <ThemedView 
          position="absolute" 
          top={70} 
          left={20} 
          right={20} 
          zIndex={10}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          
          <ThemedView flexDirection="row" alignItems="center" flex={1} marginLeft={16}>
            <Image 
              source={{ uri: status.user.profileImage }} 
              style={styles.userAvatar}
            />
            <ThemedView marginLeft={12}>
              <ThemedText color="#fff" fontSize={TYPOGRAPHY.md} fontWeight="600">
                {status.user.name}
              </ThemedText>
              <ThemedText color="rgba(255,255,255,0.7)" fontSize={TYPOGRAPHY.sm}>
                {getTimeAgo(status.createdAt)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity>
            <More size={24} color="#fff" />
          </TouchableOpacity>
        </ThemedView>

        {/* Status Content */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePause}
          onPressOut={handleResume}
          style={styles.contentTouchable}
        >
          {status.mediaUrl ? (
            <Image 
              source={{ uri: status.mediaUrl }} 
              style={styles.statusMedia}
              resizeMode="cover"
            />
          ) : (
            <ThemedView
              backgroundColor={status.backgroundColor || COLORS.primary}
              flex={1}
              justifyContent="center"
              alignItems="center"
            >
              <ThemedText
                color={status.textColor || '#fff'}
                fontSize={TYPOGRAPHY.lg}
                fontWeight="600"
                textAlign="center"
                paddingHorizontal={40}
              >
                {status.content}
              </ThemedText>
            </ThemedView>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <ThemedView 
          position="absolute" 
          bottom={50} 
          left={20} 
          right={20}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <ThemedView flexDirection="row" alignItems="center">
            <TouchableOpacity style={styles.actionButton}>
              <Heart size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Send2 size={24} color="#fff" />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView alignItems="center">
            <ThemedText color="rgba(255,255,255,0.7)" fontSize={TYPOGRAPHY.sm}>
              {status.viewCount || 0} views
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentTouchable: {
    flex: 1,
  },
  statusMedia: {
    width: '100%',
    height: '100%',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionButton: {
    marginRight: 20,
    padding: 8,
  },
  backToHomeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
});

export default ViewStatusScreen;
