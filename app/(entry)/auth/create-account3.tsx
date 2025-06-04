import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import InputField from "@/components/common/input-field";
import { AddCircle, Note } from "iconsax-react-native";
import NativeButton from "@/components/ui/native-button";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS } from "@/config/theme";

const defaultInterests = [
  "⚽ Football",
  "😋 Eating",
  "💤 Sleeping",
  "🎵 Music",
  "🎮 Gaming",
  "📚 Reading",
  "✈️ Traveling",
  "🎨 Painting",
  "🏋️‍♂️ Gym",
  "🎬 Movies",
  "📸 Photography",
  "🧘 Yoga",
  "🏃 Running",
  "🏊 Swimming",
  "🍳 Cooking",
  "🧩 Puzzles",
  "🧵 Sewing",
  "🎸 Guitar",
  "🎤 Singing",
  "📝 Writing",
  "🚴 Biking",
  "🧗 Climbing",
  "🌱 Gardening",
  "🧪 Science",
  "💻 Coding",
  "🔭 Astronomy",
  "🐶 Pet Care",
  "♟️ Chess",
  "🪴 Plant Care",
  "🛍️ Shopping",
  "💄 Makeup",
  "🎯 Darts",
  "⛳ Golf",
  "🏓 Ping Pong",
  "🛹 Skating",
  "🧘‍♀️ Meditation",
  "🎲 Board Games",
  "🛠️ DIY Projects",
  "🖼️ Art Collecting",
  "🎂 Baking",
  "🚗 Car Tuning"
];


const CreateAccount3 = () => {
  const offsetY = useSharedValue(40);
  const opacity = useSharedValue(0);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [allInterests, setAllInterests] = useState(defaultInterests);
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    offsetY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !allInterests.includes(trimmed)) {
      setAllInterests([...allInterests, trimmed]);
      setNewInterest("");
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ScrollView>
        <Animated.View style={[animatedStyle]}>
          <ThemedView padding={20}>
            <BackButton />
            <ThemedText marginTop={20} fontSize={30}>
              Help us personalize your experience.
            </ThemedText>
            <ThemedText marginTop={7}>
              Create an account by filling out the form below.
            </ThemedText>

            <ThemedText marginTop={20} fontSize={16}>
              Select Your Interests:
            </ThemedText>
            <View style={styles.interestContainer}>
              {allInterests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[
                    styles.tag,
                    selectedInterests.includes(interest) && styles.selectedTag,
                  ]}
                >
                  <ThemedText
                    color={
                      selectedInterests.includes(interest) ? "#fff" : "#333"
                    }
                  >
                    {interest}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* <InputField
              icon={<AddCircle color="#ddd" size={20} />}
              label="Add More Interests"
              placeholder="Add more..."
              value={newInterest}
              onChangeText={setNewInterest}
              onSubmitEditing={handleAddInterest}
            />
            <NativeButton
              mode="fill"
              text="Add"
              onPress={handleAddInterest}
              style={styles.addBtn}
            /> */}

            <ThemedView
              width={"30%"}
              justifyContent="flex-end"
              alignSelf="flex-end"
              marginTop={20}
            >
              <NativeButton
                href={"/auth/setup-password"}
                text={"Next"}
                mode="fill"
                style={{ borderRadius: 100 }}
              />
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAccount3;

const styles = StyleSheet.create({
  interestContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  tag: {
    borderColor: "#ddd",
    borderWidth: 0.7,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: "#f7f7f7",
  },
  selectedTag: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  addMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  addMoreInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 100,
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width : "20%",
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "flex-end",
  },
});
