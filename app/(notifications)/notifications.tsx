import { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Notification as NotificationIcon } from "iconsax-react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import {
  fetchNotificationsService,
  markNotificationAsReadService,
  Notification,
} from "@/services/notification-service.service";
import {
  handleNotificationNavigation,
  getNotificationIcon,
  formatNotificationTime,
} from "@/utils/notification-router.utils";

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from API
  const loadNotifications = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      if (loading || (!hasMore && !isRefresh)) return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetchNotificationsService(pageNum, 20);

        if (response?.data) {
          if (isRefresh) {
            setNotifications(response.data);
          } else {
            setNotifications((prev) => [...prev, ...response.data]);
          }

          setHasMore(
            response.meta?.page < response.meta?.totalPages
          );
          setPage(pageNum);
        } else {
          throw new Error(response?.error || "Failed to load notifications");
        }
      } catch (err: any) {
        console.error("Error loading notifications:", err);
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loading, hasMore]
  );

  // Load notifications when screen is focused
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setHasMore(true);
      loadNotifications(1, true);
    }, [loadNotifications])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadNotifications(1, true);
  }, [loadNotifications]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNotifications(page + 1);
    }
  }, [loading, hasMore, page, loadNotifications]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      try {
        // Mark as read if not already read
        if (!notification.is_read) {
          await markNotificationAsReadService(notification.id);
          // Update local state
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, is_read: true } : n
            )
          );
        }

        // Navigate based on notification type
        handleNotificationNavigation(notification, navigation);
      } catch (error) {
        console.error("Error handling notification press:", error);
      }
    },
    [navigation]
  );

  const renderNotificationItem = useCallback(
    ({ item }: { item: Notification }) => (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <ThemedView
          flexDirection="row"
          padding={16}
          borderBottomWidth={1}
          borderBottomColor={COLORS.gray + "20"}
          alignItems="center"
          gap={12}
          backgroundColor={
            !item.is_read ? COLORS.primary + "10" : "transparent"
          }
        >
          {/* Icon Circle */}
          <ThemedView
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor={COLORS.primary + "20"}
            justifyContent="center"
            alignItems="center"
            flexShrink={0}
          >
            <ThemedText fontSize={24}>
              {getNotificationIcon(item.type)}
            </ThemedText>
          </ThemedView>

          {/* Content */}
          <ThemedView flex={1} gap={4}>
            <ThemedView flexDirection="row" justifyContent="space-between">
              <ThemedText
                fontSize={15}
                fontWeight="600"
                color={COLORS.text}
                numberOfLines={1}
                flex={1}
              >
                {item.title}
              </ThemedText>
              {!item.is_read && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: COLORS.primary,
                    marginLeft: 8,
                  }}
                />
              )}
            </ThemedView>

            {item.body && (
              <ThemedText
                fontSize={13}
                color={COLORS.text + "cc"}
                numberOfLines={2}
              >
                {item.body}
              </ThemedText>
            )}

            <ThemedText fontSize={11} color={COLORS.text + "99"}>
              {formatNotificationTime(item.created_at)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    ),
    [handleNotificationPress]
  );

  const renderEmptyComponent = () => (
    <ThemedView
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingTop={100}
      gap={12}
    >
      <NotificationIcon
        color={COLORS.gray + "80"}
        size={64}
        variant="Outline"
      />
      <ThemedText fontSize={16} color={COLORS.text + "99"}>
        No notifications yet
      </ThemedText>
      <ThemedText fontSize={13} color={COLORS.text + "80"}>
        You're all caught up!
      </ThemedText>
    </ThemedView>
  );

  if (error && notifications.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <ThemedView padding={20} gap={20} justifyContent="center" flex={1}>
          <ThemedView alignItems="center" gap={12}>
            <NotificationIcon
              color={COLORS.gray + "80"}
              size={64}
              variant="Outline"
            />
            <ThemedText fontSize={16} fontWeight="600">
              Unable to Load Notifications
            </ThemedText>
            <ThemedText fontSize={13} color={COLORS.text + "99"}>
              {error}
            </ThemedText>
          </ThemedView>
          <TouchableOpacity
            onPress={onRefresh}
            activeOpacity={0.7}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: COLORS.primary,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <ThemedText fontSize={14} fontWeight="600" color="#fff">
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ThemedView padding={20} gap={16} flex={1}>
        {/* Header */}
        <ThemedView
          flexDirection="row"
          alignItems="center"
          gap={10}
          justifyContent="center"
        >
          <NotificationIcon color={COLORS.primary} size={30} variant="Bold" />
          <ThemedText fontSize={20} fontWeight="700">
            Notifications
          </ThemedText>
        </ThemedView>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <ThemedView flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </ThemedView>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={true}
            ListFooterComponent={
              loading && notifications.length > 0 ? (
                <ThemedView paddingVertical={20} alignItems="center">
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </ThemedView>
              ) : null
            }
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
