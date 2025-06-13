import { FlatList, StyleSheet } from "react-native";
import React from "react";
import ThemedView from "@/components/ui/themed-view";
import StatusPlaceholder from "@/components/common/status-placeholder";

const data = Array.from({ length: 10 }); // Or use real data if available

const StatusSide = () => {
  return (
    <ThemedView marginTop={10}>
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
