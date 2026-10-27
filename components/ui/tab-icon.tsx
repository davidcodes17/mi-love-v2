import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { useUserStore } from "@/store/store";
import { generateURL } from "@/utils/image-utils.utils";
import useTheme from "@/hooks/use-theme";

const ICON_SIZE = 26;
const AVATAR_SIZE = 26;

const TabIcon = ({ route, isFocused }: Props) => {
  const { user } = useUserStore();
  const theme = useTheme();
  const iconColor = isFocused ? theme.colors.primary : theme.colors.muted;

  switch (route) {
    case "home":
      return (
        <Ionicons
          name={isFocused ? "home" : "home-outline"}
          size={ICON_SIZE}
          color={iconColor}
        />
      );

    case "explore":
      return (
        <Ionicons
          name={isFocused ? "search" : "search-outline"}
          size={ICON_SIZE}
          color={iconColor}
        />
      );

    case "add":
      return (
        <View
          style={[
            styles.addBox,
            {
              backgroundColor: isFocused ? theme.colors.primary : theme.colors.soft,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Ionicons name="add" size={22} color={isFocused ? "#fff" : theme.colors.primary} />
        </View>
      );

    case "reels":
      return (
        <Ionicons
          name={isFocused ? "play-circle" : "play-circle-outline"}
          size={ICON_SIZE}
          color={iconColor}
        />
      );

    case "profile": {
      const uri = user?.profile_picture?.url;
      return (
        <View style={[styles.avatarRing, isFocused && styles.avatarRingActive, isFocused && { borderColor: theme.colors.primary }]}>
          <Image
            source={
              uri
                ? { uri: generateURL({ url: uri }) }
                : require("@/assets/user.png")
            }
            style={styles.avatar}
            defaultSource={require("@/assets/user.png")}
          />
        </View>
      );
    }

    default:
      return null;
  }
};

export default TabIcon;

interface Props {
  route: string;
  isFocused: boolean;
}

const styles = StyleSheet.create({
  addBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#B8325B",
    backgroundColor: "#F8E8ED",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    width: AVATAR_SIZE + 4,
    height: AVATAR_SIZE + 4,
    borderRadius: (AVATAR_SIZE + 4) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRingActive: { borderWidth: 2 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#efefef",
  },
});
