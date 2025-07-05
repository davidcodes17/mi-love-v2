import NotificationCompo from "@/components/common/notification-compo";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { Notification } from "iconsax-react-native";
import { SafeAreaView, ScrollView } from "react-native";

export default function Page() {
  return (
    <SafeAreaView>
      <ThemedView padding={20}>
        <ThemedView
          flexDirection="row"
          alignItems="center"
          gap={10}
          justifyContent="center"
        >
          <Notification color={COLORS.primary} size={30} variant="Bold" />
          <ThemedText fontSize={20}>Notifications</ThemedText>
        </ThemedView>

        <ThemedView paddingTop={20}>
          <ScrollView>
            <NotificationCompo />
            <NotificationCompo />
            <NotificationCompo />
            <NotificationCompo />
            <NotificationCompo />
            <NotificationCompo />
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}
