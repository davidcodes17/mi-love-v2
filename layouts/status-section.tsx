import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView from "@/components/ui/themed-view";
import StatusPlaceholder from "@/components/common/status-placeholder";
import StatusPlaceholderUser from "@/components/common/status-placeholder-user";
import { useGetAllStatus } from "@/hooks/status-hooks,hooks";
import { ApiResponse } from "@/types/status.types";

const data = Array.from({ length: 10 });

const StatusSide = () => {
  // const [data,setData] = useState<ApiResponse<>(null!);

  const fetchStatus = async () => {
    const response = await useGetAllStatus();
    console.log(response);
  };

  useEffect(() => {
    fetchStatus();
  }, []);
  return (
    <ThemedView marginTop={10} flexDirection="row" gap={10}>
      <TouchableOpacity onPress={() => console.log("Add Status")}>
        <StatusPlaceholderUser />
      </TouchableOpacity>
      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        renderItem={() => <StatusPlaceholder />}
        showsHorizontalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default StatusSide;

const styles = StyleSheet.create({});
