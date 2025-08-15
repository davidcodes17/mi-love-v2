import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Eye, Trash, More } from "iconsax-react-native";

import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
import { COLORS, TYPOGRAPHY } from "@/config/theme";
import { 
  useGetSingleStatus, 
  useDeleteStatus,
  useGetStatusViewers 
} from "@/hooks/status-hooks,hooks";
import { Status, StatusViewer } from "@/types/status.types";

const { width, height } = Dimensions.get('window');

const PersonalStatusScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [status, setStatus] = useState<Status | null>(null);
  const [viewers, setViewers] = useState<StatusViewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewers, setShowViewers] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<any>(null);

  useEffect(() => {
    if (id) {
      fetchStatusAndViewers();
      startProgressAnimation();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [id]);

  const fetchStatusAndViewers = async () => {
    try {
      const [statusResponse, viewersResponse] = await Promise.all([
        useGetSingleStatus({ id: id! }),
        useGetStatusViewers({ id: id! }),
      ]);

      if (statusResponse?.data) {
        setStatus(statusResponse.data);
      }
      if (viewersResponse?.data) {
        setViewers(viewersResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch status data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startProgressAnimation = () => {
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          router.back();
          return 0;
        }
        return prev + 0.5; // Slower progress for personal view
      });
    }, 50);
  };

  const handleDeleteStatus = () => {
    Alert.alert(
      "Delete Status",
      "Are you sure you want to delete this status? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await useDeleteStatus({ id: id! });
              if (response?.message) {
                router.back();
              }
            } catch (error) {
              console.error('Failed to delete status:', error);
              Alert.alert('Error', 'Failed to delete status. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleViewers = () => {
    setShowViewers(!showViewers);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderViewerItem = ({ item: viewer }: { item: StatusViewer }) => (
    <ThemedView 
      flexDirection="row" 
      alignItems="center" 
      paddingVertical={12}
      paddingHorizontal={20}
    >
      <Image 
        source={{ uri: viewer.user.profileImage }} 
        style={styles.viewerAvatar}
      />
      <ThemedView flex={1} marginLeft={12}>
        <ThemedText 
          color="#fff" 
          fontSize={TYPOGRAPHY.md} 
          fontWeight="600"
        >
          {viewer.user.name}
        </ThemedText>
        <ThemedText 
          color="rgba(255,255,255,0.7)" 
          fontSize={TYPOGRAPHY.sm}
        >
          {getTimeAgo(viewer.viewedAt)}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

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
      
      <ThemedView flex={1}>
        {!showViewers ? (
          // Status View
          <>
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
                    Your Story
                  </ThemedText>
                  <ThemedText color="rgba(255,255,255,0.7)" fontSize={TYPOGRAPHY.sm}>
                    {getTimeAgo(status.createdAt)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <TouchableOpacity onPress={handleDeleteStatus}>
                <Trash size={24} color="#fff" />
              </TouchableOpacity>
            </ThemedView>

            {/* Status Content */}
            <TouchableOpacity
              activeOpacity={1}
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
              alignItems="center"
            >
              <TouchableOpacity 
                style={styles.viewersButton}
                onPress={toggleViewers}
              >
                <Eye size={20} color="#fff" />
                <ThemedText color="#fff" fontSize={TYPOGRAPHY.md} marginLeft={8}>
                  {viewers.length} {viewers.length === 1 ? 'view' : 'views'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        ) : (
          // Viewers List
          <ThemedView flex={1}>
            <ThemedView 
              flexDirection="row" 
              alignItems="center" 
              justifyContent="space-between"
              paddingHorizontal={20}
              paddingVertical={16}
              borderBottomWidth={1}
              borderBottomColor="rgba(255,255,255,0.1)"
            >
              <TouchableOpacity onPress={toggleViewers}>
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              <ThemedText color="#fff" fontSize={TYPOGRAPHY.lg} fontWeight="600">
                Viewers
              </ThemedText>
              <TouchableOpacity onPress={handleDeleteStatus}>
                <Trash size={24} color="#fff" />
              </TouchableOpacity>
            </ThemedView>

            {viewers.length > 0 ? (
              <FlatList
                data={viewers}
                keyExtractor={(item) => item.id}
                renderItem={renderViewerItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.viewersList}
              />
            ) : (
              <ThemedView flex={1} justifyContent="center" alignItems="center">
                <Eye size={60} color="rgba(255,255,255,0.3)" />
                <ThemedText 
                  color="rgba(255,255,255,0.7)" 
                  fontSize={TYPOGRAPHY.md}
                  textAlign="center"
                  marginTop={20}
                >
                  No one has viewed your story yet
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}
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
  viewerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  viewersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  viewersList: {
    paddingVertical: 10,
  },
  backToHomeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
});

export default PersonalStatusScreen;
