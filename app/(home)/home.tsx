import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { toast } from "@/components/lib/toast-manager";
import globalStyles from "@/components/styles/global-styles";
import Header from "@/layouts/header";
import ThemedView from "@/components/ui/themed-view";
import StatusSide from "@/layouts/status-section";
import Interests from "@/layouts/interests";
import Posts from "@/layouts/posts";

export default function HomeScreen() {
  const components = ["header", "status", "interests", "posts"];

  const renderComponent = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    let Component;
    switch (item) {
      case "header":
        Component = Header;
        break;
      case "status":
        Component = StatusSide;
        break;
      case "interests":
        Component = Interests;
        break;
      case "posts":
        Component = Posts;
        break;
      default:
        return null;
    }

    return (
      <Animated.View entering={FadeInUp.delay(index * 100)}>
        <Component />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView paddingHorizontal={20} flex={1}>
        <FlatList
          data={components}
          keyExtractor={(item) => item}
          renderItem={renderComponent}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
