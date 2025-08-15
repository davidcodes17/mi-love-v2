import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { ArrowLeft, Add, Eye, More } from "iconsax-react-native";

import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { 
  useGetAllStatus, 
  useGetMyStatus, 
  useDeleteStatus 
} from "@/hooks/status-hooks,hooks";
import { Status } from "@/types/status.types";
import { useUserProfileStore } from "@/hooks/auth-hooks.hooks";

const { width } = Dimensions.get('window');

const StatusScreen = () => {
  const [allStatuses, setAllStatuses] = useState<Status[]>([]);
  const [myStatuses, setMyStatuses] = useState<Status[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [loading, setLoading] = useState(true);
  const profile = useUserProfileStore((state) => state.profile);

  const fetchStatuses = useCallback(async () => {
    try {
      const [allResponse, myResponse] = await Promise.all([
        useGetAllStatus(),
        useGetMyStatus(),
      ]);

      if (allResponse?.data) {
        setAllStatuses(allResponse.data);
      }
      if (myResponse?.data) {
        setMyStatuses(myResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStatuses();
    setRefreshing(false);
  }, [fetchStatuses]);

  const handleViewStatus = useCallback((status: Status) => {
    router.push({
      pathname: "/(status)/view-status",
      params: { id: status.id }
    });
  }, []);

  const handleViewPersonalStatus = useCallback((status: Status) => {
    router.push({
      pathname: "/(status)/personal-status",
      params: { id: status.id }
    });
  }, []);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const renderStatusItem = ({ item: status, index }: { item: Status; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)}>
      <TouchableOpacity
        style={styles.statusCard}
        onPress={() => 
          status.userId === profile?.id 
            ? handleViewPersonalStatus(status)
            : handleViewStatus(status)
        }
        activeOpacity={0.9}
      >
        {/* Status Content */}
        {status.mediaUrl ? (
          <Image source={{ uri: status.mediaUrl }} style={styles.statusMedia} />
        ) : (
          <ThemedView 
            backgroundColor={status.backgroundColor || COLORS.primary}
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            padding={12}
          >
            <ThemedText 
              color={status.textColor || '#fff'}
              fontSize={13}
              fontWeight="600"
              textAlign="center"
              numberOfLines={4}
            >
              {status.content}
            </ThemedText>
          </ThemedView>
        )}
        
        {/* Minimal Overlay */}
        <ThemedView position="absolute" bottom={0} left={0} right={0}>
          <ThemedView 
            backgroundColor="rgba(0,0,0,0.6)"
            paddingHorizontal={8}
            paddingVertical={6}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <ThemedView flexDirection="row" alignItems="center" flex={1}>
              <Image 
                source={{ uri: status.user.profileImage }} 
                style={styles.miniAvatar} 
              />
              <ThemedText 
                color="#fff"
                fontSize={11}
                fontWeight="500"
                marginLeft={4}
                flex={1}
                numberOfLines={1}
              >
                {status.user.name}
              </ThemedText>
            </ThemedView>
            
            <ThemedView flexDirection="row" alignItems="center">
              <Eye size={10} color="#fff" />
              <ThemedText 
                color="#fff"
                fontSize={10}
                marginLeft={2}
                marginRight={6}
              >
                {status.viewCount || 0}
              </ThemedText>
              <ThemedText 
                color="#fff"
                fontSize={10}
              >
                {getTimeAgo(status.createdAt)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Status indicator for personal stories */}
        {status.userId === profile?.id && (
          <ThemedView 
            position="absolute"
            top={6}
            right={6}
            backgroundColor="rgba(0,0,0,0.6)"
            borderRadius={10}
            padding={4}
          >
            <More size={12} color="#fff" />
          </ThemedView>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const currentData = activeTab === 'all' ? allStatuses : myStatuses;

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView flex={1}>
        {/* Minimal Header */}
        <Animated.View entering={FadeInDown.delay(100)}>
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
              Stories
            </ThemedText>
            
            <TouchableOpacity
              onPress={() => router.push({
                pathname: "/(status)/create-status"
              })}
              style={styles.addButton}
            >
              <Add size={20} color="#fff" />
            </TouchableOpacity>
          </ThemedView>
        </Animated.View>

        {/* Minimal Tab Selector */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <ThemedView 
            flexDirection="row" 
            marginHorizontal={20}
            marginTop={16}
            marginBottom={20}
          >
            {['all', 'my'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton
                ]}
                onPress={() => setActiveTab(tab as 'all' | 'my')}
              >
                <ThemedText 
                  fontSize={14}
                  fontWeight={activeTab === tab ? "600" : "400"}
                  color={activeTab === tab ? "#000" : "#666"}
                >
                  {tab === 'all' ? 'All' : 'Mine'}
                </ThemedText>
                {activeTab === tab && (
                  <ThemedView 
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    height={2}
                    backgroundColor={COLORS.primary}
                    borderRadius={1}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        </Animated.View>

        {/* Stories Grid */}
        {loading ? (
          <ThemedView flex={1} justifyContent="center" alignItems="center">
            <ThemedText color="#999" fontSize={14}>Loading...</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={currentData}
            keyExtractor={(item) => item.id}
            renderItem={renderStatusItem}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Animated.View entering={FadeInUp.delay(300)}>
                <ThemedView alignItems="center" paddingTop={80}>
                  <ThemedView 
                    width={80}
                    height={80}
                    backgroundColor="#f8f8f8"
                    borderRadius={40}
                    justifyContent="center"
                    alignItems="center"
                    marginBottom={16}
                  >
                    <Eye size={32} color="#ccc" />
                  </ThemedView>
                  <ThemedText 
                    fontSize={16}
                    color="#999"
                    textAlign="center"
                    marginBottom={8}
                  >
                    {activeTab === 'all' ? 'No stories yet' : 'No stories posted'}
                  </ThemedText>
                  <ThemedText 
                    fontSize={13}
                    color="#ccc"
                    textAlign="center"
                    lineHeight={18}
                  >
                    {activeTab === 'all' 
                      ? 'Stories from friends will appear here' 
                      : 'Share your first story with friends'
                    }
                  </ThemedText>
                  {activeTab === 'my' && (
                    <TouchableOpacity
                      style={styles.createFirstButton}
                      onPress={() => router.push({
                        pathname: "/(status)/create-status"
                      })}
                    >
                      <Add size={16} color="#fff" />
                      <ThemedText 
                        color="#fff" 
                        fontSize={13} 
                        fontWeight="600"
                        marginLeft={6}
                      >
                        Create Story
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </ThemedView>
              </Animated.View>
            }
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    // Active styling handled by indicator
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusCard: {
    width: (width - 56) / 3, // 20px padding on each side + 8px gaps
    aspectRatio: 0.75, // 3:4 ratio
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    position: 'relative',
  },
  statusMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
});

export default StatusScreen;
