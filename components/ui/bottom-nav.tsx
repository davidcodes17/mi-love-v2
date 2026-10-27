import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabIcon from "./tab-icon";
import useTheme from "@/hooks/use-theme";

const TAB_ORDER = ["home", "explore", "add", "reels", "profile"] as const;

const BottomNav = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const arranged = TAB_ORDER.map((name) =>
    state.routes.find((route) => route.name === name)
  ).filter(Boolean) as typeof state.routes;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          shadowColor: theme.colors.text,
        },
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {arranged.map((route) => {
        const { options } = descriptors[route.key];
        const isFocused = state.routes[state.index]?.key === route.key;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, { merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={
              options.tabBarAccessibilityLabel || route.name
            }
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tab, isFocused && { backgroundColor: theme.colors.soft }]}
          >
            <TabIcon route={route.name} isFocused={isFocused} />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#dbdbdb",
    paddingTop: 8,
    width: "100%",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    marginHorizontal: 5,
    borderRadius: 18,
  },
});

export default BottomNav;
