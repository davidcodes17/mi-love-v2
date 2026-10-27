import React, { useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import {
  AppearanceMode,
  usePreferencesStore,
} from "@/store/preferences-store";
import useTheme from "@/hooks/use-theme";

type ToggleRow = {
  key: keyof ReturnType<typeof usePreferencesStore.getState>;
  label: string;
  subtitle: string;
  value: boolean;
  onChange: (next: boolean) => void;
};

const APPEARANCE_OPTIONS: { value: AppearanceMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function AppPreferencesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    appearance,
    hapticsEnabled,
    autoplayVideos,
    muteVideosByDefault,
    dataSaver,
    reduceMotion,
    confirmBeforeSendGift,
    hideSensitiveMedia,
    keepOriginalQuality,
    hydrate,
    setPreference,
    resetPreferences,
  } = usePreferencesStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const buzz = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // device may not support haptics
    }
  };

  const toggles: ToggleRow[] = [
    {
      key: "hapticsEnabled",
      label: "Haptic feedback",
      subtitle: "Vibrate lightly on taps and actions",
      value: hapticsEnabled,
      onChange: async (next) => {
        await setPreference("hapticsEnabled", next);
        if (next) {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        }
      },
    },
    {
      key: "autoplayVideos",
      label: "Autoplay videos",
      subtitle: "Play feed videos when they appear on screen",
      value: autoplayVideos,
      onChange: async (next) => {
        await setPreference("autoplayVideos", next);
        buzz();
      },
    },
    {
      key: "muteVideosByDefault",
      label: "Start videos muted",
      subtitle: "Videos open muted until you unmute",
      value: muteVideosByDefault,
      onChange: async (next) => {
        await setPreference("muteVideosByDefault", next);
        buzz();
      },
    },
    {
      key: "dataSaver",
      label: "Data saver",
      subtitle: "Prefer lower-resolution media when available",
      value: dataSaver,
      onChange: async (next) => {
        await setPreference("dataSaver", next);
        buzz();
      },
    },
    {
      key: "reduceMotion",
      label: "Reduce motion",
      subtitle: "Limit animations and transitions on this device",
      value: reduceMotion,
      onChange: async (next) => {
        await setPreference("reduceMotion", next);
        buzz();
      },
    },
    {
      key: "confirmBeforeSendGift",
      label: "Confirm before sending gifts",
      subtitle: "Ask before coins are spent in chat",
      value: confirmBeforeSendGift,
      onChange: async (next) => {
        await setPreference("confirmBeforeSendGift", next);
        buzz();
      },
    },
    {
      key: "hideSensitiveMedia",
      label: "Blur sensitive media",
      subtitle: "Blur media thumbnails until you tap to view",
      value: hideSensitiveMedia,
      onChange: async (next) => {
        await setPreference("hideSensitiveMedia", next);
        buzz();
      },
    },
    {
      key: "keepOriginalQuality",
      label: "Keep original photo quality",
      subtitle: "Upload and save media at full quality",
      value: keepOriginalQuality,
      onChange: async (next) => {
        await setPreference("keepOriginalQuality", next);
        buzz();
      },
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={25} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: theme.colors.text }]}>App preferences</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.muted }]}>Theme</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <ThemedText style={[styles.cardHint, { color: theme.colors.muted }]}>
            Choose how Mi Love looks on this device. No account sync required.
          </ThemedText>
          <View style={[styles.segment, { backgroundColor: theme.colors.soft }]}>
            {APPEARANCE_OPTIONS.map((option) => {
              const active = appearance === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.segmentBtn, active && { backgroundColor: theme.colors.surface }]}
                  onPress={async () => {
                    await setPreference("appearance", option.value);
                    buzz();
                  }}
                  activeOpacity={0.75}
                >
                  <ThemedText
                    style={[
                      styles.segmentLabel,
                      active && { color: theme.colors.primary, fontWeight: "700" },
                      { color: active ? theme.colors.primary : theme.colors.muted },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ThemedText style={[styles.sectionTitle, { color: theme.colors.muted }]}>Media and feedback</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {toggles.map((item, index) => (
            <View
              key={String(item.key)}
              style={[
                styles.toggleRow,
                index < toggles.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.toggleCopy}>
                <ThemedText style={[styles.toggleLabel, { color: theme.colors.text }]}>{item.label}</ThemedText>
                <ThemedText style={[styles.toggleSubtitle, { color: theme.colors.muted }]}>
                  {item.subtitle}
                </ThemedText>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
                ios_backgroundColor="#dbdbdb"
              />
            </View>
          ))}
        </View>

        <ThemedText style={[styles.sectionTitle, { color: theme.colors.muted }]}>Reset</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TouchableOpacity
            style={styles.resetRow}
            onPress={() =>
              Alert.alert(
                "Reset app preferences?",
                "This only resets local settings on this phone. Your account stays signed in.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                      await resetPreferences();
                      Alert.alert("Done", "Preferences restored to defaults.");
                    },
                  },
                ]
              )
            }
          >
            <ThemedText style={styles.resetLabel}>
              Reset all preferences
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSpacer: { width: 40 },
  content: { paddingBottom: 40 },
  sectionTitle: {
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    borderColor: COLORS.border,
  },
  cardHint: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.muted,
  },
  segment: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f8e8ed",
    borderRadius: 14,
    padding: 3,
    gap: 2,
  },
  segmentBtn: {
    flex: 1,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8e8e8e",
  },
  segmentLabelActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  toggleRow: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  toggleCopy: { flex: 1, paddingRight: 8 },
  toggleLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 13,
    lineHeight: 17,
    color: COLORS.muted,
  },
  resetRow: {
    minHeight: 52,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  resetLabel: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: "500",
  },
});
