import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";

const Interests = () => {
  const defaultInterests = [
    "⚽ Football", "😋 Eating", "💤 Sleeping", "🎵 Music", "🎮 Gaming",
    "📚 Reading", "✈️ Traveling", "🎨 Painting", "🏋️‍♂️ Gym", "🎬 Movies",
    "📸 Photography", "🧘 Yoga", "🏃 Running", "🏊 Swimming", "🍳 Cooking",
    "🧩 Puzzles", "🧵 Sewing", "🎸 Guitar", "🎤 Singing", "📝 Writing",
    "🚴 Biking", "🧗 Climbing", "🌱 Gardening", "🧪 Science", "💻 Coding",
    "🔭 Astronomy", "🐶 Pet Care", "♟️ Chess", "🪴 Plant Care", "🛍️ Shopping",
    "💄 Makeup", "🎯 Darts", "⛳ Golf", "🏓 Ping Pong", "🛹 Skating",
    "🧘‍♀️ Meditation", "🎲 Board Games", "🛠️ DIY Projects", "🖼️ Art Collecting",
    "🎂 Baking", "🚗 Car Tuning",
  ];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <ThemedView marginTop={20}>
      <ThemedView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={10}
      >
        <ThemedText weight="semibold" fontSize={20}>
          Interests
        </ThemedText>
        <ThemedText color={COLORS.primary}>View all</ThemedText>
      </ThemedView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.interestContainer}>
          {defaultInterests.map((interest) => (
            <TouchableOpacity
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={[
                styles.tag,
                selectedInterests.includes(interest) && styles.selectedTag,
              ]}
            >
              <ThemedText
                color={selectedInterests.includes(interest) ? "#fff" : "#333"}
              >
                {interest}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

export default Interests;

const styles = StyleSheet.create({
  interestContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
    maxHeight: 90, // limits to 2 lines depending on tag height
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
});
