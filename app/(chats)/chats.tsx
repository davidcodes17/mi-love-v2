import {
  Image,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { Add, ArrowLeft2, Call, Send2, Video } from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import { Href, router } from "expo-router";

const Chats = () => {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderChat />
    
        <ChatInput />
    </SafeAreaView>
  );
};

export default Chats;

// Header
const HeaderChat = () => {
  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={12}
      paddingVertical={10}
      borderBottomWidth={1}
      borderBottomColor="#eee"
      backgroundColor="#fff"
    >

      {/* User Info */}
      <ThemedView flexDirection="row" alignItems="center" flexShrink={1}>
      {/* Back button */}
      <TouchableOpacity style={{ marginRight: 10 }}>
        <ArrowLeft2 size={30} color="#000" />
      </TouchableOpacity>
        <Image
          source={{
            uri: "https://img.freepik.com/free-vector/smiling-redhaired-boy-illustration_1308-176664.jpg?semt=ais_hybrid&w=740",
          }}
          style={styles.userImage}
        />
        <ThemedView marginLeft={10}>
          <ThemedText fontSize={16} fontWeight="600" color="#000">
            Areegbe David
          </ThemedText>
          <ThemedText fontSize={12} color="#666">
            Last seen 2 mins ago
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Call / Video Icons */}
      <ThemedView
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-end"
        gap={10}
        marginLeft={10}
      >
        <TouchableOpacity onPress={()=>{
          console.log("CLicked")
          router.push("/(chats)/call" as Href)
        }}>
          <Call color={COLORS.primary} size={30} variant="Broken" />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{
          console.log("CLicked Video")
          const channelId = 'chatroom123';
          router.push(`/video-call?channel=${channelId}` as Href);
        }}>
          <Video color={COLORS.primary} size={30} variant="Broken" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};


// Chat Input
const ChatInput = () => {
  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      padding={10}
      paddingVertical={20}
      position="absolute"
      bottom={0}
      borderTopWidth={0.3}
      borderTopColor="#eee"
      backgroundColor="#fafafa"
      gap={10}
    >
      <TouchableOpacity>
        <Add size={30} color={COLORS.primary} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={{
        backgroundColor : COLORS.primary,
        padding : 10,
        flexDirection : "row",
        alignItems : "center",
        borderRadius : 400
      }}>
        <Send2 size={20} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position : 'relative'
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
    borderWidth : 0.2,
    borderColor : "#ddd",
    padding : 3
  },
  input: {
    flex: 1,
    borderWidth: 0.3,
    borderColor: "#ddd",
    borderRadius: 30,
    paddingVertical: 12,
    fontFamily: "Quicksand_400Regular",
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: "#fff",
  },
});
