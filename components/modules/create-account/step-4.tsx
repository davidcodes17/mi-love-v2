import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import NativeButton from "@/components/ui/native-button";
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
  "🚗 Car Tuning",
];

interface Step4Props {
  values: any;
  errors: any;
  touched: any;
  handleChange: (field: string) => (value: any) => void;
  handleBlur: (field: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const Step4 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step4Props) => {
  const toggleInterest = (interest: string) => {
    const current = values.interests || [];
    if (current.includes(interest)) {
      handleChange("interests")(current.filter((i: string) => i !== interest));
    } else {
      handleChange("interests")([...current, interest]);
    }
  };

  return (
    <ThemedView>
      <ScrollView
        contentContainerStyle={{ padding: 10, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
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
          {defaultInterests.map((interest) => (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={[
                styles.tag,
                values.interests &&
                  values.interests.includes(interest) &&
                  styles.selectedTag,
              ]}
            >
              <ThemedText
                color={
                  values.interests && values.interests.includes(interest)
                    ? "#fff"
                    : "#333"
                }
              >
                {interest}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {touched.interests && errors.interests && (
          <ThemedText color="red" marginTop={4}>
            {errors.interests}
          </ThemedText>
        )}

        <ThemedView
          width={"30%"}
          justifyContent="flex-end"
          alignSelf="flex-end"
          marginTop={20}
        >
          <NativeButton
            onPress={onNext}
            text={isLast ? "Submit" : "Next"}
            mode="fill"
            style={{ borderRadius: 100 }}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  interestContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "space-between",
  },
  tag: {
    borderColor: "#ddd",
    borderWidth: 0.7,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: "#f7f7f7",
    marginBottom: 10,
    width: "48%",
    alignItems: "center",
  },
  selectedTag: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});

export default Step4;
