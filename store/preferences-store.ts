import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const PREFERENCES_STORAGE_KEY = "@milove/app_preferences_v1";

export type AppearanceMode = "system" | "light" | "dark";

export type AppPreferences = {
  appearance: AppearanceMode;
  hapticsEnabled: boolean;
  autoplayVideos: boolean;
  muteVideosByDefault: boolean;
  dataSaver: boolean;
  reduceMotion: boolean;
  confirmBeforeSendGift: boolean;
  hideSensitiveMedia: boolean;
  keepOriginalQuality: boolean;
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  appearance: "system",
  hapticsEnabled: true,
  autoplayVideos: true,
  muteVideosByDefault: true,
  dataSaver: false,
  reduceMotion: false,
  confirmBeforeSendGift: true,
  hideSensitiveMedia: false,
  keepOriginalQuality: true,
};

type PreferencesStore = AppPreferences & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K]
  ) => Promise<void>;
  resetPreferences: () => Promise<void>;
};

const persist = async (state: AppPreferences) => {
  await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(state));
};

const pickPrefs = (state: PreferencesStore): AppPreferences => ({
  appearance: state.appearance,
  hapticsEnabled: state.hapticsEnabled,
  autoplayVideos: state.autoplayVideos,
  muteVideosByDefault: state.muteVideosByDefault,
  dataSaver: state.dataSaver,
  reduceMotion: state.reduceMotion,
  confirmBeforeSendGift: state.confirmBeforeSendGift,
  hideSensitiveMedia: state.hideSensitiveMedia,
  keepOriginalQuality: state.keepOriginalQuality,
});

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppPreferences>;
        set({ ...DEFAULT_PREFERENCES, ...parsed, hydrated: true });
        return;
      }
    } catch {
      // keep defaults
    }
    set({ hydrated: true });
  },

  setPreference: async (key, value) => {
    set({ [key]: value } as Partial<PreferencesStore>);
    await persist(pickPrefs(get()));
  },

  resetPreferences: async () => {
    set({ ...DEFAULT_PREFERENCES });
    await persist(DEFAULT_PREFERENCES);
  },
}));
