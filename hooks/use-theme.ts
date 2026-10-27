import THEME from "@/config/theme";
import { usePreferencesStore } from "@/store/preferences-store";
import { useColorScheme } from "react-native";

export default () => {
  const system = useColorScheme() || "light";
  const appearance = usePreferencesStore((s) => s.appearance);
  const scheme =
    appearance === "system" ? system : appearance === "dark" ? "dark" : "light";

  return THEME[scheme];
};

export function useResolvedColorScheme(): "light" | "dark" {
  const system = useColorScheme() || "light";
  const appearance = usePreferencesStore((s) => s.appearance);
  if (appearance === "system") {
    return system === "dark" ? "dark" : "light";
  }
  return appearance;
}
