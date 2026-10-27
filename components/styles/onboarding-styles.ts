import { StyleSheet } from "react-native";
import { COLORS } from "@/config/theme";

/** Shared Mi Love auth, onboarding, and signup-step tokens. */
export const IG = {
  bg: COLORS.background,
  text: COLORS.text,
  muted: COLORS.muted,
  border: COLORS.border,
  fieldBg: "#FFFDFB",
  primary: COLORS.primary,
  primaryDisabled: "#D9A2B2",
  link: COLORS.primary,
  divider: COLORS.border,
};

export const onboardingStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: IG.bg,
  },
  screenPad: {
    flex: 1,
    paddingHorizontal: 28,
  },
  brand: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 40,
    fontWeight: "700",
    color: IG.text,
    letterSpacing: -1.4,
    textAlign: "center",
  },
  title: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 27,
    fontWeight: "700",
    color: IG.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Quicksand_500Medium",
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: IG.muted,
  },
  fieldLabel: {
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 12,
    fontWeight: "600",
    color: IG.muted,
    marginBottom: 6,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: IG.primary,
    borderRadius: 18,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  primaryBtnDisabled: {
    backgroundColor: IG.primaryDisabled,
  },
  primaryBtnText: {
    fontFamily: "Quicksand_700Bold",
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  outlineBtn: {
    marginTop: 12,
    borderRadius: 18,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: IG.border,
    backgroundColor: "#fff",
  },
  outlineBtnText: {
    fontFamily: "Quicksand_600SemiBold",
    color: IG.text,
    fontSize: 14,
    fontWeight: "600",
  },
  link: {
    fontFamily: "Quicksand_700Bold",
    color: IG.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  mutedLink: {
    color: IG.link,
    fontSize: 12,
    fontWeight: "500",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: IG.divider,
  },
  dividerText: {
    color: IG.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  footerBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: IG.border,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  footerMuted: {
    color: IG.muted,
    fontSize: 14,
  },
});

export default onboardingStyles;
