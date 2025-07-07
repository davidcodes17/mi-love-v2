import BackButton from "@/components/common/back-button";
import globalStyles from "@/components/styles/global-styles";
import NativeButton from "@/components/ui/native-button";
import NativeText from "@/components/ui/native-text";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { Heart, More, MoreCircle } from "iconsax-react-native";
import { ScrollView } from "react-native";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, Link } from "expo-router";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <BackButton />
          <ThemedText weight="bold">areegbedavid</ThemedText>
          <ThemedView>
            <More variant="Outline" color="#000" size={30} />
          </ThemedView>
        </ThemedView>
        <ThemedView>
          <ThemedView
            flexDirection="row"
            justifyContent="center"
            marginTop={20}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1557296387-5358ad7997bb?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFjZSUyMHdvbWFufGVufDB8fDB8fHww",
              }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 100,
              }}
            />
          </ThemedView>
          <ThemedView>
            <ThemedText
              weight="bold"
              fontSize={20}
              textAlign="center"
              marginTop={10}
            >
              Areegbe David
            </ThemedText>
            <ThemedText
              fontSize={12}
              textAlign="center"
              paddingHorizontal={20}
              paddingVertical={5}
            >
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id natus
              expedita harum
            </ThemedText>

            <ThemedView
              justifyContent="space-around"
              flexDirection="row"
              gap={50}
              marginTop={20}
            >
              <ThemedView>
                <ThemedText textAlign="center" weight="medium" fontSize={20}>
                  120
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Posts
                </ThemedText>
              </ThemedView>
              <ThemedView>
                <ThemedText textAlign="center" weight="medium" fontSize={20}>
                  16.1M
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Followers
                </ThemedText>
              </ThemedView>
              <ThemedView>
                <ThemedText textAlign="center" weight="medium" fontSize={20}>
                  125
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Following
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView flexDirection="row" marginTop={20}>
              <NativeButton
                mode="outline"
                text={"Edit Profile"}
                style={{
                  flex: 1,
                  marginRight: 10,
                  borderRadius: 200,
                }}
              />
              <NativeButton
                mode="fill"
                text={"Chats"}
                style={{
                  flex: 1,
                  borderRadius: 200,
                }}
              />
            </ThemedView>

            {/* A good grid view of images 2 per row */}
            <ThemedView
              flexDirection="row"
              flexWrap="wrap"
              justifyContent="space-between"
              marginTop={20}
            >
              {[
                {
                  uri: "https://www.vie-aesthetics.com/wp-content/uploads/2021/09/shutterstock_1877631178-600x600.jpg",
                },
                {
                  uri: "https://www.shutterstock.com/image-photo/beautiful-closeup-portrait-latina-woman-600nw-2522123873.jpg",
                },
                {
                  uri: "https://vivre.cc/wp-content/uploads/2023/04/ansikte-.jpg",
                },
                {
                  uri: "https://media.gettyimages.com/id/1309405076/photo/beauty-portrait-of-young-woman.jpg?s=612x612&w=gi&k=20&c=9x4kq6gojpC0geUtyJyWLJnl4QutuqReHGeVmQC2U_s=",
                },
              ].map((img, idx) => (
                <Link href={`/(home)/view-friend/${idx}` as Href} asChild key={idx}>
                  <View
                    style={{
                      width: "48%",
                      aspectRatio: 1,
                      marginBottom: 12,
                      borderRadius: 12,
                      overflow: "hidden",
                      backgroundColor: "#eee",
                      position: "relative",
                    }}
                  >
                    <Image
                      source={{ uri: img.uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                    <ThemedView
                      position="absolute"
                      flexDirection="row"
                      left={20}
                      bottom={10}
                      alignItems="center"
                      gap={2}
                    >
                      <ThemedText color={"#fff"} fontSize={20}>4</ThemedText>
                      <Heart color={"white"} variant="Bold" size={20} />
                    </ThemedView>
                  </View>
                </Link>
              ))}
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
