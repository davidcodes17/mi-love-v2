import globalStyles from "@/components/styles/global-styles";
import NativeButton from "@/components/ui/native-button";
import NativeText from "@/components/ui/native-text";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { AddSquare } from "iconsax-react-native";
import { Image, ScrollView } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ScrollView>
        <ThemedView padding={20}>
          <ThemedText textAlign="center" fontSize={20} weight="medium">
            Create Post
          </ThemedText>

          <ThemedView marginTop={20}>
            <ThemedView flexDirection="row" justifyContent="space-between">
              <ThemedView flexDirection="row" gap={10} alignItems="center">
                <Image
                  source={{
                    uri: "https://cdn.dribbble.com/userupload/36974838/file/original-c2508a14d3725cbfa022122d6ada6015.jpg?resize=752x&vertical=center",
                  }}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 100,
                  }}
                />
                <ThemedView>
                  <ThemedText weight="bold">areegbedavid</ThemedText>
                  <ThemedText>Areegbe David</ThemedText>
                </ThemedView>
              </ThemedView>
              <NativeButton
                mode="fill"
                text={"Post"}
                style={{
                  paddingVertical: 2,
                  borderRadius: 200,
                  paddingHorizontal: 30,
                }}
              />
            </ThemedView>

            <ThemedView marginTop={20}>
              <TextInput
                multiline={true}
                numberOfLines={3}
                placeholder="What’s on your mind, areegbedavid?"
                style={{
                  // borderColor: "#ddd",
                  // borderWidth: 1,
                  fontFamily: "Quicksand_500Medium",
                  fontSize: 20,
                  padding: 10,
                  height: 200,
                }}
                scrollEnabled
              />
            </ThemedView>

            <ThemedView flexDirection="row" gap={10} alignItems="center">
              <ThemedView>
                <ScrollView
                  style={{
                  }}
                  horizontal
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 20,
                      marginRight: 20,
                    }}
                  />
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 20,
                      marginRight: 20,
                    }}
                  />
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 20,
                      marginRight: 20,
                    }}
                  />
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 20,
                      marginRight: 20,
                    }}
                  />
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww",
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 20,
                      marginRight: 20,
                    }}
                  />
                </ScrollView>
              </ThemedView>
              </ThemedView>
              <ThemedView
                width={100}
                height={100}
                borderWidth={1.4}
                borderColor={COLORS.primary}
                borderRadius={20}
                marginTop={10}
              >
                <ThemedView
                  justifyContent="center"
                  flexDirection="row"
                  paddingTop={30}
                >
                  <AddSquare size={30} color={COLORS.primary} />
                </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
