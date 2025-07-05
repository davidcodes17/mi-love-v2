import { Image } from "react-native";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";

const NotificationCompo = () => {
  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      marginBottom={40}
      justifyContent="space-between"
    >
      <ThemedView flexDirection="row" alignItems="center" gap={10}>
        <Image
          source={{
            uri: "https://cdn.dribbble.com/userupload/36974838/file/original-c2508a14d3725cbfa022122d6ada6015.jpg?resize=752x&vertical=center",
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 200,
          }}
        />
        <ThemedView>
          <ThemedText color={"#aaa"}>
            <ThemedText weight="bold" color={'#000'}>@areegbedavid </ThemedText>followed you
          </ThemedText>
          <ThemedText color={"#aaa"} fontSize={12} paddingTop={5}>26/06/2025</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedView justifyContent="flex-end" flexDirection="row">
          <ThemedView
            width={12}
            height={12}
            backgroundColor={COLORS.primary}
            borderRadius={100}
          ></ThemedView>
        </ThemedView>
        <ThemedText color={"#aaa"} fontSize={12} paddingTop={5}>13 mins ago</ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

export default NotificationCompo;
