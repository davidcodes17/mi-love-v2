import React from "react";
import { FlatList, View } from "react-native";
import FriendCompo from "@/components/common/friend-compo";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/config/theme";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import globalStyles from "@/components/styles/global-styles";
import { Profile2User } from "iconsax-react-native";

const friendData = Array.from({ length: 12 }, (_, i) => ({ id: i.toString() }));

export default function Page() {
  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <FlatList
        data={friendData}
        keyExtractor={(item) => item.id}
        renderItem={() => <FriendCompo isFriend={true} />}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={() => (
          <ThemedView
            alignItems="center"
            flexDirection="row"
            marginBottom={20}
            gap={10}
            justifyContent="center"
          >
            <Profile2User variant="Bold" size={20} color={COLORS.primary} />
            <ThemedText textAlign="center" fontSize={20}>
              Friends
            </ThemedText>
          </ThemedView> 
        )}
      />
    </SafeAreaView>
  );
}
