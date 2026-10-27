import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useUserStore } from "@/store/store";
import { logoutAndClearSession } from "@/hooks/auth-hooks.hooks";
import { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { useDeleteAccount } from "@/hooks/account-hooks.hooks";
import { AUTH_STORAGE_KEYS } from "@/services/auth-service.service";
import NativeButton from "@/components/ui/native-button";
import {
  PREFERENCES_STORAGE_KEY,
  usePreferencesStore,
} from "@/store/preferences-store";
import useTheme from "@/hooks/use-theme";

type IconName = keyof typeof Ionicons.glyphMap;

type SettingsItem = {
  label: string;
  icon: IconName;
  onPress?: () => void;
  destructive?: boolean;
  chevron?: boolean;
  valueLabel?: string;
  toggle?: {
    value: boolean;
    onChange: (next: boolean) => void;
  };
};

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

/** Keys we never wipe when clearing local cache */
const PROTECTED_STORAGE_KEYS = new Set([
  AUTH_STORAGE_KEYS.accessToken,
  AUTH_STORAGE_KEYS.signupToken,
  AUTH_STORAGE_KEYS.resetToken,
  AUTH_STORAGE_KEYS.resetOtp,
  AUTH_STORAGE_KEYS.resetEmail,
  PREFERENCES_STORAGE_KEY,
]);

const Settings = () => {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useUserStore();
  const {
    hydrate,
    hapticsEnabled,
    dataSaver,
    autoplayVideos,
    setPreference,
  } = usePreferencesStore();
  const [query, setQuery] = useState("");
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const buzz = async () => {
    if (!hapticsEnabled) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
  };

  const appVersion =
    Constants.expoConfig?.version ||
    Constants.nativeAppVersion ||
    "1.0.0";
  const buildNumber =
    Constants.expoConfig?.android?.versionCode?.toString() ||
    Constants.nativeBuildVersion ||
    "";

  const handleDeleteAccount = () => {
    setDeleteVisible(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword || deleteConfirmation !== "DELETE") return;
    setDeleting(true);
    try {
      const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
      if (!token) {
        Alert.alert("Session expired", "Please sign in again and retry.");
        return;
      }
      const response = await useDeleteAccount({
        token,
        password: deletePassword,
      });
      if (response?.error || response?.status === "error") {
        Alert.alert(
          "Unable to delete account",
          response?.message || response?.error || "Check your password and retry."
        );
        return;
      }
      await logoutAndClearSession();
      setDeleteVisible(false);
      router.replace("/");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out of Mi Love?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutAndClearSession();
            router.replace("/");
          } catch {
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
      },
    ]);
  };

  const clearLocalCache = () => {
    Alert.alert(
      "Clear cache?",
      "Removes temporary app data on this device. You’ll stay signed in and preferences are kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const removable = keys.filter((key) => !PROTECTED_STORAGE_KEYS.has(key));
              if (removable.length) {
                await AsyncStorage.multiRemove(removable);
              }
              await buzz();
              Alert.alert("Cache cleared", "Temporary data was removed.");
            } catch {
              Alert.alert("Error", "Could not clear cache. Please try again.");
            }
          },
        },
      ]
    );
  };

  const shareProfile = async () => {
    const username = user?.username || "milove";
    try {
      await Share.share({
        message: `Find me on Mi Love: @${username}\nzeelove://profile/${user?.id || ""}`,
      });
    } catch {}
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message:
          "Join me on Mi Love — chat, share, and connect.\nhttps://mi-love-gilt.vercel.app",
      });
    } catch {}
  };

  const openSystemSettings = () => {
    Linking.openSettings().catch(() =>
      Alert.alert("Unavailable", "Could not open system settings.")
    );
  };

  const openNotificationHelp = () => {
    Alert.alert(
      "Push notifications",
      "Use your phone Settings to allow or block Mi Love notifications. We can’t change that from inside the app.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: openSystemSettings },
      ]
    );
  };

  const sections: SettingsSection[] = useMemo(
    () => [
      {
        title: "Your account",
        items: [
          {
            label: "Accounts Center",
            icon: "person-circle-outline",
            onPress: () => router.push("/edit-account" as Href),
          },
          {
            label: "Edit profile",
            icon: "create-outline",
            onPress: () => router.push("/edit-account" as Href),
          },
          {
            label: "Share profile",
            icon: "share-outline",
            onPress: shareProfile,
            chevron: false,
          },
        ],
      },
      {
        title: "How you use Mi Love",
        items: [
          {
            label: "Notifications",
            icon: "notifications-outline",
            onPress: () =>
              router.push("/(notifications)/notifications" as Href),
          },
          {
            label: "Device notification settings",
            icon: "phone-portrait-outline",
            onPress: openNotificationHelp,
          },
          {
            label: "Friends",
            icon: "people-outline",
            onPress: () => router.push("/(home)/friends" as Href),
          },
          {
            label: "Messages",
            icon: "paper-plane-outline",
            onPress: () => router.push("/(home)/inbox" as Href),
          },
        ],
      },
      {
        title: "Your app and media",
        items: [
          {
            label: "App preferences",
            icon: "options-outline",
            onPress: () => router.push("/(settings)/app-preferences" as Href),
          },
          {
            label: "Data saver",
            icon: "cellular-outline",
            chevron: false,
            toggle: {
              value: dataSaver,
              onChange: async (next) => {
                await setPreference("dataSaver", next);
                buzz();
              },
            },
          },
          {
            label: "Autoplay videos",
            icon: "play-circle-outline",
            chevron: false,
            toggle: {
              value: autoplayVideos,
              onChange: async (next) => {
                await setPreference("autoplayVideos", next);
                buzz();
              },
            },
          },
          {
            label: "Haptic feedback",
            icon: "phone-portrait-outline",
            chevron: false,
            toggle: {
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
          },
          {
            label: "Clear cache",
            icon: "trash-bin-outline",
            onPress: clearLocalCache,
            chevron: false,
          },
        ],
      },
      {
        title: "Payments and gifts",
        items: [
          {
            label: "Wallet",
            icon: "wallet-outline",
            onPress: () => router.push("/(settings)/wallet" as Href),
          },
          {
            label: "Gift shop",
            icon: "gift-outline",
            onPress: () =>
              router.push("/(settings)/wallet/gift-shop" as Href),
          },
        ],
      },
      {
        title: "Who can see your content",
        items: [
          {
            label: "Blocked users",
            icon: "ban-outline",
            onPress: () => router.push("/(friends)/blocked-users" as Href),
          },
          {
            label: "Privacy and Policy",
            icon: "lock-closed-outline",
            onPress: () =>
              Linking.openURL("https://mi-love-gilt.vercel.app/privacy.html"),
          },
        ],
      },
      {
        title: "More info and support",
        items: [
          {
            label: "Share Mi Love",
            icon: "heart-outline",
            onPress: shareApp,
            chevron: false,
          },
          {
            label: "Help",
            icon: "help-circle-outline",
            onPress: () =>
              Linking.openURL("https://mi-love-gilt.vercel.app/privacy.html"),
          },
          {
            label: "About",
            icon: "information-circle-outline",
            onPress: () =>
              Alert.alert(
                "Mi Love",
                `Version ${appVersion}${buildNumber ? ` (${buildNumber})` : ""}\n\nBuilt for connecting with people you care about.`
              ),
            valueLabel: `v${appVersion}`,
          },
          {
            label: "Open system settings",
            icon: "settings-outline",
            onPress: openSystemSettings,
          },
        ],
      },
      {
        title: "Login",
        items: [
          {
            label: "Add account",
            icon: "person-add-outline",
            onPress: () => router.push("/(entry)/auth/login" as Href),
            chevron: false,
          },
          {
            label: "Log out",
            icon: "log-out-outline",
            onPress: handleLogout,
            chevron: false,
          },
          {
            label: "Delete account",
            icon: "trash-outline",
            onPress: handleDeleteAccount,
            destructive: true,
            chevron: false,
          },
        ],
      },
    ],
    [
      router,
      dataSaver,
      autoplayVideos,
      hapticsEnabled,
      setPreference,
      appVersion,
      buildNumber,
      user?.username,
      user?.id,
    ]
  );

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query, sections]);

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
        <ThemedText style={[styles.headerTitle, { color: theme.colors.text }]}>Settings and activity</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.searchBox, { backgroundColor: theme.colors.soft }]}>
          <Ionicons name="search" size={16} color={theme.colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={theme.colors.muted}
            style={[styles.searchInput, { color: theme.colors.text }]}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        <TouchableOpacity
          style={[styles.metaCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          activeOpacity={0.7}
          onPress={() => router.push("/edit-account" as Href)}
        >
          <View style={styles.metaIconWrap}>
            <Ionicons name="grid-outline" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.metaCopy}>
            <ThemedText style={[styles.metaTitle, { color: theme.colors.text }]}>Accounts Center</ThemedText>
            <ThemedText style={[styles.metaSubtitle, { color: theme.colors.muted }]}>
              Password, security, personal details, ad preferences
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
        </TouchableOpacity>

        {user?.username ? (
          <ThemedText style={[styles.accountHint, { color: theme.colors.muted }]}>
            Logged in as @{user.username}
          </ThemedText>
        ) : null}

        {filteredSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.muted }]}>{section.title}</ThemedText>
            <View style={[styles.sectionBody, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {section.items.map((item, index) => {
                const isLast = index === section.items.length - 1;
                const isLogout = item.label === "Log out";
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={item.toggle ? undefined : item.onPress}
                    activeOpacity={item.toggle ? 1 : 0.65}
                    disabled={!!item.toggle}
                    style={[styles.row, !isLast && styles.rowBorder]}
                  >
                    <View style={styles.rowLeft}>
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={
                          item.destructive
                            ? COLORS.error
                            : isLogout
                              ? COLORS.primary
                              : theme.colors.text
                        }
                      />
                      <ThemedText
                        style={[
                          styles.rowLabel,
                          item.destructive && styles.destructiveLabel,
                          isLogout && styles.logoutLabel,
                        ]}
                      >
                        {item.label}
                      </ThemedText>
                    </View>
                    {item.toggle ? (
                      <Switch
                        value={item.toggle.value}
                        onValueChange={item.toggle.onChange}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor="#fff"
                        ios_backgroundColor="#dbdbdb"
                      />
                    ) : item.valueLabel ? (
                      <View style={styles.valueWrap}>
                        <ThemedText style={styles.valueLabel}>
                          {item.valueLabel}
                        </ThemedText>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={theme.colors.muted}
                        />
                      </View>
                    ) : (
                      item.chevron !== false && (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={theme.colors.muted}
                        />
                      )
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {filteredSections.length === 0 && (
          <View style={styles.empty}>
            <ThemedText style={[styles.emptyText, { color: theme.colors.muted }]}>No results found</ThemedText>
          </View>
        )}

        <ThemedText style={styles.footerMeta}>
          Mi Love {appVersion}
          {Platform.OS === "ios" ? " · iOS" : " · Android"}
        </ThemedText>
      </ScrollView>
      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => !deleting && setDeleteVisible(false)}
          />
          <View style={styles.modalCard}>
            <ThemedText style={styles.deleteTitle}>
              Delete account permanently
            </ThemedText>
            <ThemedText style={styles.deleteCopy}>
              Enter your password and type DELETE to confirm. This cannot be undone.
            </ThemedText>
            <TextInput
              style={styles.confirmInput}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Password"
              secureTextEntry
            />
            <TextInput
              style={styles.confirmInput}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="Type DELETE"
              autoCapitalize="characters"
            />
            <View style={styles.modalActions}>
              <NativeButton
                mode="outline"
                text="Cancel"
                onPress={() => setDeleteVisible(false)}
                disabled={deleting}
                style={{ flex: 1 }}
              />
              <NativeButton
                mode="fill"
                text="Delete"
                onPress={confirmDeleteAccount}
                isLoading={deleting}
                disabled={
                  deleting ||
                  !deletePassword ||
                  deleteConfirmation !== "DELETE"
                }
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  searchBox: {
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#f8e8ed",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  metaCard: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  metaCopy: {
    flex: 1,
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  metaSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.muted,
  },
  accountHint: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 12,
    color: COLORS.muted,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
  },
  sectionBody: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutLabel: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  destructiveLabel: {
    color: COLORS.error,
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  valueLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  empty: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  footerMeta: {
    marginTop: 28,
    textAlign: "center",
    color: "#c7c7c7",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },
  deleteTitle: {
    color: COLORS.error,
    fontSize: 21,
    fontWeight: "700",
  },
  deleteCopy: {
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
});
