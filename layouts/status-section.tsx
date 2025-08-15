import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import StatusPlaceholder from "@/components/common/status-placeholder";
import StatusPlaceholderUser from "@/components/common/status-placeholder-user";
import { useGetAllStatus } from "@/hooks/status-hooks,hooks";
import { Status } from "@/types/status.types";

const StatusSide = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await useGetAllStatus();
      if (response?.data) {
        setStatuses(response.data.slice(0, 10)); // Limit to 10 for horizontal scroll
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAddStatus = () => {
    router.push({
      pathname: "/(status)/create-status"
    });
  };

  const handleStatusPress = (status: Status) => {
    router.push({
      pathname: "/(status)/view-status",
      params: { id: status.id }
    });
  };

  const handleSeeAllStatuses = () => {
    router.push({
      pathname: "/(status)/status"
    });
  };

  return (
    <ThemedView marginTop={10}>
      <ThemedView flexDirection="row" gap={10}>
        <TouchableOpacity onPress={handleAddStatus}>
          {/* <StatusPlaceholderUser /> */}
        </TouchableOpacity>
        <FlatList
          data={statuses}
          keyExtractor={(item) => item.id}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleStatusPress(item)}>
              <StatusPlaceholder status={item} />
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={() => 
            loading ? null : (
              <TouchableOpacity onPress={handleSeeAllStatuses}>
                <ThemedView 
                  width={120} 
                  height={150} 
                  backgroundColor="#f5f5f5"
                  borderRadius={10}
                  justifyContent="center"
                  alignItems="center"
                  marginRight={10}
                >
                  <ThemedText fontSize={12} textAlign="center" color="#666">
                    No stories yet{'\n'}Tap to explore
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            )
          }
        />
      </ThemedView>
    </ThemedView>
  );
};


export default StatusSide;
