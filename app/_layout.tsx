import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useSegments, useRouter, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import {
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import { Toast } from "@/components/lib/toast-manager";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { CallProvider } from "@/context/call-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "@/store/store";
import LoadingScreen from "@/components/common/loading-screen";
import { useNotificationListeners, useDeepLinkHandler } from "@/hooks/notification-hooks.hooks";
import { useResolvedColorScheme } from "@/hooks/use-theme";
import { usePreferencesStore } from "@/store/preferences-store";
import { COLORS } from "@/config/theme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Protected route groups that require authentication
const PROTECTED_ROUTES = [
  "(home)",
  "(chats)",
  "(settings)",
  "(friends)",
  "(notifications)",
  "(search)",
];

// Protected standalone routes (root level)
const PROTECTED_STANDALONE_ROUTES = [
  "video-call",
  "outgoing-call",
  "ringing",
  "post",
  "status",
  "for-you",
  "payment-callback",
];

// Public route groups that don't require authentication
const PUBLIC_ROUTES = ["(entry)"];

function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check authentication status (both token and user object)
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);

        // Small delay to prevent flickering
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!mounted) return;

        const token = await AsyncStorage.getItem("token");
        const hasToken = !!token;
        const hasUser = !!user && Object.keys(user).length > 0;

        // User is authenticated only if BOTH token and user object exist
        const authenticated = hasToken && hasUser;

        if (mounted) {
          setIsAuthenticated(authenticated);
        }
      } catch (error) {
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
          setHasChecked(true);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Handle redirects when route changes or auth state changes
  useEffect(() => {
    if (!hasChecked || isCheckingAuth || isRedirecting) return;

    const currentRoute = String(segments[0] || "");
    const path = pathname || "";

    // Check if current path is a protected route
    const isProtectedRoute = PROTECTED_ROUTES.includes(currentRoute);
    const isProtectedStandalone = PROTECTED_STANDALONE_ROUTES.some((route) =>
      path.includes(route)
    );
    const isOnEntryRoute =
      path.startsWith("/(entry)") || path.startsWith("/auth") || path === "/";

    // If not authenticated (no token OR no user), redirect to entry unless already on entry route
    if (!isAuthenticated) {
      if (
        isProtectedRoute ||
        isProtectedStandalone ||
        (!isOnEntryRoute && path !== "")
      ) {
        setIsRedirecting(true);
        router.replace("/");
        setIsRedirecting(false);
        return;
      }
    }

    // If authenticated and on entry route (but not on specific auth pages), redirect to home
    if (isAuthenticated && isOnEntryRoute) {
      // Only redirect if on the main entry/index page, not on specific auth pages like login, create-account
      const isOnAuthPage =
        path.includes("/auth/login") ||
        path.includes("/auth/create-account") ||
        path.includes("/auth/forgot-password") ||
        path.includes("/auth/reset-password") ||
        path.includes("/auth/verify-otp");

      if (!isOnAuthPage && path === "/") {
        setIsRedirecting(true);
        router.replace("/home");
        setIsRedirecting(false);
      }
    }
  }, [
    segments,
    pathname,
    isAuthenticated,
    isCheckingAuth,
    hasChecked,
    router,
    isRedirecting,
  ]);

  if (isCheckingAuth || isRedirecting) {
    return (
      <LoadingScreen
        message={isRedirecting ? "Redirecting..." : "Checking authentication..."}
      />
    );
  }

  return <>{children}</>;
}

function NotificationListenersComponent() {
  // Set up notification listeners for foreground/background notifications
  useNotificationListeners();
  
  // Set up deep link handler for reward claims and navigation
  useDeepLinkHandler();

  return null;
}

export default function RootLayout() {
  const colorScheme = useResolvedColorScheme();
  const hydratePreferences = usePreferencesStore((s) => s.hydrate);
  const [loaded] = useFonts({
    Quicksand_300Light,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  const LightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.text,
      border: COLORS.border,
      notification: COLORS.accent,
    },
  } satisfies Theme;
  const DarkAppTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: "#F18AA1",
      background: "#171117",
      card: "#241C24",
      text: "#FFF6F7",
      border: "#3B2D38",
      notification: "#F39A82",
    },
  } satisfies Theme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkAppTheme : LightTheme}>
          <ProtectedRouteWrapper>
            <CallProvider>
              <NotificationListenersComponent />
              <Stack>
                <Stack.Screen name="(home)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(search)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="(chats)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(notifications)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(settings)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(friends)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="(entry)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="video-call"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="outgoing-call"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="ringing" options={{ headerShown: false }} />
                <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="post/likes" options={{ headerShown: false }} />
                <Stack.Screen
                  name="status/create"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="status/view"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="for-you" options={{ headerShown: false }} />
                <Stack.Screen
                  name="payment-callback"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </CallProvider>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Toast />
          </ProtectedRouteWrapper>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
