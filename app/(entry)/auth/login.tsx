import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import * as Yup from "yup";
import { ValidationError } from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { LoginPayLoad } from "@/types/auth.types";
import {
  loginServiceProxy,
  launchOAuth,
  useNotificationService,
  useGetProfile,
} from "@/hooks/auth-hooks.hooks";
import { toast } from "@/components/lib/toast-manager";
import { useUserStore } from "@/store/store";
import { registerForPushNotificationsAsync } from "@/utils/fcm-token.utils";
import {
  requestCameraPermission,
  requestImageLibraryPermission,
} from "@/utils/permissions-utils.utils";
import { AUTH_STORAGE_KEYS } from "@/services/auth-service.service";
import { IG, onboardingStyles } from "@/components/styles/onboarding-styles";
import { COLORS } from "@/config/theme";

const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const LoginScreen = () => {
  const [data, setData] = useState<LoginPayLoad>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"apple" | null>(null);
  const [secure, setSecure] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const { user, setUser } = useUserStore();

  const canSubmit =
    data.email.trim().length > 0 && data.password.trim().length >= 6 && !loading;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
        if (token && user) {
          router.replace("/home");
          return;
        }
        if (token && !user) {
          try {
            const profileData = await useGetProfile();
            if (profileData?.data && !profileData?.error) {
              setUser(profileData.data);
              router.replace("/home");
              return;
            }
            await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
          } catch {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
          }
        }
      } catch {}
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const requestInitialPermissions = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) setExpoPushToken(token);
      await requestCameraPermission(false);
      await requestImageLibraryPermission(false);
    };
    requestInitialPermissions();
  }, []);

  const handleLogin = async () => {
    try {
      await loginSchema.validate(data, { abortEarly: false });
      setLoading(true);
      const response = await loginServiceProxy({ data });
      setLoading(false);

      if (response?.access_token) {
        toast.success("Login successful!");
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEYS.accessToken,
          response.access_token
        );
        try {
          const profileData = await useGetProfile();
          if (profileData?.data && !profileData?.error) {
            setUser(profileData.data);
          }
        } catch {}

        if (expoPushToken) {
          try {
            await useNotificationService({ token: expoPushToken });
          } catch {}
        } else {
          registerForPushNotificationsAsync().then(async (token) => {
            if (token) {
              try {
                await useNotificationService({ token });
              } catch {}
            }
          });
        }

        router.replace("/home");
        return;
      }
      toast.error(response?.message || "Login failed");
    } catch (error) {
      setLoading(false);
      if (error instanceof ValidationError) {
        toast.error(error.errors?.[0] || "Invalid input");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleOAuth = async (provider: "apple") => {
    try {
      setOauthLoading(provider);
      await launchOAuth(provider);
    } catch {
      toast.error(`Unable to start ${provider} sign in.`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.topLanguage}>
            <Text style={styles.languageText}>English (US)</Text>
            <Ionicons name="chevron-down" size={14} color="#8e8e8e" />
          </View>

          <View style={styles.formBlock}>
            <View style={styles.brandLockup}>
              <View style={styles.brandMark}>
                <Ionicons name="heart" size={15} color="#fff" />
              </View>
              <Text style={styles.brand}>mi love</Text>
            </View>
            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>Your people have been waiting.</Text>
            </View>

            <View style={styles.fields}>
              <View style={styles.field}>
                <TextInput
                  value={data.email}
                  onChangeText={(email) =>
                    setData((prev) => ({ ...prev, email }))
                  }
                  placeholder="Email address"
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <TextInput
                  value={data.password}
                  onChangeText={(password) =>
                    setData((prev) => ({ ...prev, password }))
                  }
                  placeholder="Password"
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry={secure}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setSecure((s) => !s)}
                  hitSlop={10}
                >
                  <Text style={styles.showText}>
                    {secure ? "Show" : "Hide"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={!canSubmit}
                activeOpacity={0.85}
                style={[
                  onboardingStyles.primaryBtn,
                  !canSubmit && onboardingStyles.primaryBtnDisabled,
                  { marginTop: 14 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={onboardingStyles.primaryBtnText}>Log in</Text>
                )}
              </TouchableOpacity>

              <Link href="/auth/forgot-password" asChild>
                <TouchableOpacity style={styles.forgot}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {Platform.OS === "ios" && (
              <>
                <View style={onboardingStyles.dividerRow}>
                  <View style={onboardingStyles.dividerLine} />
                  <Text style={onboardingStyles.dividerText}>OR</Text>
                  <View style={onboardingStyles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={[styles.oauthRow, { marginTop: 18 }]}
                  onPress={() => handleOAuth("apple")}
                  disabled={oauthLoading !== null}
                >
                  <Ionicons name="logo-apple" size={20} color="#262626" />
                  <Text style={styles.oauthText}>
                    {oauthLoading === "apple"
                      ? "Opening Apple..."
                      : "Log in with Apple"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        <View style={onboardingStyles.footerBar}>
          <Text style={onboardingStyles.footerMuted}>
            Don&apos;t have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/create-account")}>
            <Text style={onboardingStyles.link}> Sign up.</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: IG.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  topLanguage: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F8E8ED",
  },
  languageText: {
    fontFamily: "Quicksand_500Medium",
    color: COLORS.muted,
    fontSize: 13,
  },
  formBlock: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 18,
  },
  fields: {
    marginTop: 30,
  },
  field: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: IG.border,
    backgroundColor: IG.fieldBg,
    borderRadius: 17,
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontFamily: "Quicksand_500Medium",
    flex: 1,
    fontSize: 15,
    color: IG.text,
    paddingVertical: 14,
  },
  showText: {
    fontFamily: "Quicksand_600SemiBold",
    color: IG.text,
    fontSize: 14,
    fontWeight: "600",
    paddingLeft: 8,
  },
  forgot: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 4,
  },
  forgotText: {
    fontFamily: "Quicksand_600SemiBold",
    color: IG.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  oauthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: IG.border,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  oauthText: {
    fontFamily: "Quicksand_600SemiBold",
    color: IG.text,
    fontSize: 14,
    fontWeight: "600",
  },
  brandLockup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontFamily: "Quicksand_700Bold",
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -1,
  },
  welcomeCopy: {
    marginTop: 34,
    alignItems: "center",
  },
  welcomeTitle: {
    fontFamily: "Quicksand_700Bold",
    color: COLORS.text,
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  welcomeSubtitle: {
    fontFamily: "Quicksand_500Medium",
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 7,
  },
});
