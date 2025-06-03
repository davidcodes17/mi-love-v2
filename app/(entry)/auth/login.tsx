import { View, Text, SafeAreaView, TextInput, Image } from "react-native";
import React from "react";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import BackButton from "@/components/common/back-button";
import { Google, Lock, Sms } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";

const LoginScreen = () => {
  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView padding={20}>
        <ThemedView>
          <BackButton />
          <ThemedText marginTop={20} fontSize={30}>
            Login
          </ThemedText>
          <ThemedText marginTop={7}>
            By logging in. you agree to our Terms Of Use
          </ThemedText>
        </ThemedView>

        <ThemedView marginTop={30}>
          <ThemedText>Email Address</ThemedText>
          <ThemedView
            marginTop={5}
            borderWidth={0.3}
            borderColor={"#ddd"}
            padding={3}
            paddingHorizontal={10}
            borderRadius={10}
            alignItems="center"
            flexDirection="row"
          >
            <Sms color="#ddd" size={25} />
            <TextInput
              style={{
                padding: 10,
                width: "100%",
                borderRadius: 10,
                fontSize: 18,
                fontFamily: "Quicksand_500Medium",
              }}
              keyboardType="email-address"
              returnKeyType="next"
              returnKeyLabel="next"
              placeholder="you@gmail.com"
            />
          </ThemedView>
        </ThemedView>
        <ThemedView marginTop={20}>
          <ThemedText>Password</ThemedText>
          <ThemedView
            marginTop={5}
            borderWidth={0.3}
            borderColor={"#ddd"}
            padding={3}
            paddingHorizontal={10}
            borderRadius={10}
            alignItems="center"
            flexDirection="row"
          >
            <Lock color="#ddd" size={25} />
            <TextInput
              style={{
                padding: 10,
                width: "100%",
                borderRadius: 10,
                fontSize: 18,
                fontFamily: "Quicksand_500Medium",
              }}
              secureTextEntry
              returnKeyType="next"
              returnKeyLabel="next"
              placeholder="* * * * * * * * * * * * * * * "
            />
          </ThemedView>
        </ThemedView>

        <ThemedText textAlign="right" weight="semibold" marginTop={10}>
          Forgotten Password?
        </ThemedText>

        <ThemedView>
          <NativeButton
            text={"Login"}
            mode="fill"
            style={{
              borderRadius: 100,
              marginTop: 20,
            }}
            href={"/home"}
          />
        </ThemedView>

        <ThemedText paddingVertical={20} textAlign="center">
          Or
        </ThemedText>

        <ThemedView
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap={10}
          borderWidth={1}
          borderColor={"#ddd"}
          paddingVertical={15}
          borderRadius={100}
        >
          <Image
            source={require("@/assets/images/google.png")}
            style={{
              width: 20,
              height: 20,
            }}
          />
          <ThemedText fontSize={15}>Sign In with Google</ThemedText>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default LoginScreen;
