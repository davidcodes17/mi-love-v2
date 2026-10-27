import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetProfile, useUserProfileStore } from "@/hooks/auth-hooks.hooks";
import { useUserStore } from "@/store/store";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/config/theme";

const DATING_PHOTOS = {
  couple: {
    uri: "https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&w=900&q=85",
  },
  heart: {
    uri: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85",
  },
  sunset: {
    uri: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=900&q=85",
  },
  wedding: {
    uri: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85",
  },
};

const ONBOARDING_PAGES = [
  {
    title: "Dating, with deeper clarity.",
    description:
      "Go beyond swipes. Explore how mental, emotional, and physical compatibility create real connections. ❤️",
    art: "people",
  },
  {
    title: "Compatibility, explained simply.",
    description:
      "Understand what makes a connection work, and discover people who feel right for you. ✨",
    art: "match",
  },
  {
    title: "A real connection starts here.",
    description:
      "Meet with intention, share your story, and build something that lasts. 💌",
    art: "connect",
  },
] as const;

const Onboarding = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [page, setPageState] = useState(0);
  const pagerRef = useRef<ScrollView>(null);
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const { setUser } = useUserStore();
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700 });
  }, [logoOpacity]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setCheckingAuth(false);
          return;
        }
        try {
          const profileData = await useGetProfile();
          if (profileData?.data && !profileData?.error) {
            setProfile(profileData.data);
            setUser(profileData.data);
            router.replace("/home");
            return;
          }
          await AsyncStorage.removeItem("token");
          setCheckingAuth(false);
        } catch {
          await AsyncStorage.removeItem("token");
          setCheckingAuth(false);
        }
      } catch {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value }));

  if (checkingAuth) {
    return (
      <View style={styles.splash}>
        <LinearGradient
          colors={[COLORS.accent, COLORS.primary]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.splashGlyph}
        >
          <Ionicons name="heart" size={38} color="#fff" />
        </LinearGradient>
      </View>
    );
  }

  const goToPage = (nextPage: number) => {
    const next = Math.max(0, Math.min(nextPage, ONBOARDING_PAGES.length - 1));
    pagerRef.current?.scrollTo({ x: next * width, animated: true });
    setPageState(next);
  };

  const onPagerSettled = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setPageState(Math.max(0, Math.min(next, ONBOARDING_PAGES.length - 1)));
  };

  const continueOnboarding = () => {
    if (page < ONBOARDING_PAGES.length - 1) {
      goToPage(page + 1);
      return;
    }
    router.push("/auth/create-account");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#FFE9CA", "#FBE4F0", "#F2F5FF", "#FFFFFF"]}
        locations={[0, 0.3, 0.58, 0.82]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topBar}>
        <Animated.View style={[styles.wordmark, logoStyle]}>
          <View style={styles.brandMark}>
            <Ionicons name="heart" size={14} color="#fff" />
          </View>
          <Text style={styles.brand}>mi love</Text>
        </Animated.View>
        <TouchableOpacity onPress={() => router.push("/auth/create-account")} hitSlop={10}>
          <Text style={styles.skip}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onPagerSettled}
        style={styles.pager}
      >
        {ONBOARDING_PAGES.map((item, index) => (
          <View key={item.art} style={[styles.page, { width }]}>
            <View style={[styles.artboard, { height: Math.min(height * 0.47, 390) }]}>
              <View style={styles.artGlow} />
              {index === 0 ? (
                <PeopleCollage />
              ) : index === 1 ? (
                <MatchCollage />
              ) : (
                <ConnectionCollage />
              )}
            </View>
            <View style={styles.copyBlock}>
              <Text style={styles.pageTitle}>{item.title}</Text>
              <Text style={styles.pageDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBlock}>
        <View style={styles.dots}>
          {ONBOARDING_PAGES.map((item, index) => (
            <TouchableOpacity
              key={item.art}
              accessibilityRole="button"
              accessibilityLabel={`Go to onboarding page ${index + 1}`}
              onPress={() => goToPage(index)}
              style={[styles.dot, page === index && styles.activeDot]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.88}
          onPress={continueOnboarding}
        >
          <Text style={styles.continueText}>
            {page === ONBOARDING_PAGES.length - 1 ? "Get started" : "Continue"}
          </Text>
          {page < ONBOARDING_PAGES.length - 1 && (
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/auth/login")}
          hitSlop={8}
        >
          <Text style={styles.loginText}>
            Already a member? <Text style={styles.loginEmphasis}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const Portrait = ({ source, style }: { source: ImageSourcePropType; style: StyleProp<ViewStyle> }) => (
  <View style={[styles.portraitFrame, style]}>
    <Image source={source} style={styles.portrait} resizeMode="cover" />
  </View>
);

const PeopleCollage = () => (
  <>
    <Portrait source={DATING_PHOTOS.couple} style={styles.personOne} />
    <Portrait source={DATING_PHOTOS.heart} style={styles.personTwo} />
    <Portrait source={DATING_PHOTOS.sunset} style={styles.personThree} />
    <Portrait source={DATING_PHOTOS.wedding} style={styles.personFour} />
    <View style={[styles.floatIcon, styles.flowerOne]}><Text style={styles.flowerText}>✿</Text></View>
    <View style={[styles.floatIcon, styles.flowerTwo]}><Text style={styles.flowerText}>✦</Text></View>
    <View style={[styles.floatIcon, styles.flowerThree]}><Text style={styles.flowerText}>♥</Text></View>
  </>
);

const MatchCollage = () => (
  <>
    <View style={[styles.photoBack, styles.photoBackLeft]}>
      <Image source={DATING_PHOTOS.wedding} style={styles.backImage} resizeMode="cover" />
    </View>
    <View style={[styles.photoBack, styles.photoBackRight]}>
      <Image source={DATING_PHOTOS.sunset} style={styles.backImage} resizeMode="cover" />
    </View>
    <View style={styles.matchCard}>
      <Image source={DATING_PHOTOS.couple} style={styles.matchImage} resizeMode="cover" />
      <View style={styles.matchBadge}>
        <Ionicons name="flash" size={12} color="#fff" />
        <Text style={styles.matchBadgeText}>Similar to you</Text>
      </View>
      <Text style={styles.matchName}>Meet someone genuine</Text>
      <Text style={styles.matchDetail}>Connection begins with understanding.</Text>
    </View>
    <View style={[styles.reaction, styles.reactionHeart]}><Text>❤️</Text></View>
    <View style={[styles.reaction, styles.reactionSparkle]}><Text>✨</Text></View>
    <View style={[styles.reaction, styles.reactionLike]}><Text>👍</Text></View>
  </>
);

const ConnectionCollage = () => (
  <>
    <View style={styles.chatPhotoCard}>
      <Image source={DATING_PHOTOS.couple} style={styles.chatPhoto} resizeMode="cover" />
    </View>
    <View style={styles.chatBubbleOne}>
      <Text style={styles.chatText}>That sounds like my kind of weekend ✨</Text>
    </View>
    <View style={styles.chatBubbleTwo}>
      <Text style={styles.chatTextLight}>Same here! Tell me more ❤️</Text>
    </View>
    <View style={styles.chatHeart}><Ionicons name="heart" size={21} color="#B8325B" /></View>
    <View style={styles.chatAvatar}>
      <Image source={DATING_PHOTOS.heart} style={styles.chatAvatarImage} />
    </View>
  </>
);

export default Onboarding;

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  splashGlyph: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  topBar: {
    height: 50,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  wordmark: { flexDirection: "row", alignItems: "center", gap: 7 },
  brandMark: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: -0.8,
  },
  skip: {
    fontFamily: "Quicksand_700Bold",
    color: "#685A62",
    fontSize: 11,
    letterSpacing: 0.4,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.52)",
  },
  pager: { flex: 1 },
  page: { flex: 1, alignItems: "center", paddingHorizontal: 20 },
  artboard: {
    width: "100%",
    maxWidth: 430,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  artGlow: {
    position: "absolute",
    width: "88%",
    height: "74%",
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.48)",
    transform: [{ rotate: "-10deg" }],
  },
  portraitFrame: {
    position: "absolute",
    padding: 5,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 28,
    shadowColor: "#382331",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  portrait: { width: "100%", height: "100%", borderRadius: 23, backgroundColor: "#F3E6E7" },
  personOne: { width: 112, height: 152, left: "7%", top: "16%", transform: [{ rotate: "-8deg" }] },
  personTwo: { width: 142, height: 190, right: "6%", top: "9%", transform: [{ rotate: "7deg" }] },
  personThree: { width: 128, height: 164, left: "12%", bottom: "7%", transform: [{ rotate: "5deg" }] },
  personFour: { width: 100, height: 132, right: "11%", bottom: "9%", transform: [{ rotate: "-7deg" }] },
  floatIcon: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#382331",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  flowerOne: { left: "13%", top: "43%", transform: [{ rotate: "-18deg" }] },
  flowerTwo: { right: "9%", top: "18%" },
  flowerThree: { left: "47%", bottom: "11%", backgroundColor: "#FFE2E5" },
  flowerText: { fontSize: 25, color: "#EF9C78" },
  copyBlock: { width: "100%", maxWidth: 430, alignItems: "center", paddingHorizontal: 12, paddingTop: 2 },
  pageTitle: {
    fontFamily: "Quicksand_700Bold",
    color: "#171417",
    fontSize: 27,
    lineHeight: 32,
    textAlign: "center",
    letterSpacing: -0.8,
    maxWidth: 340,
  },
  pageDescription: {
    fontFamily: "Quicksand_500Medium",
    marginTop: 12,
    color: "#71666C",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 340,
  },
  bottomBlock: { paddingHorizontal: 32, paddingTop: 4, paddingBottom: 2 },
  dots: { height: 22, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 9 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D4D0D1" },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#211C1F" },
  continueButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1B191A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: "#171417",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  continueText: { fontFamily: "Quicksand_700Bold", color: "#fff", fontSize: 15 },
  loginLink: { alignItems: "center", paddingVertical: 12 },
  loginText: { fontFamily: "Quicksand_500Medium", color: "#786D73", fontSize: 13 },
  loginEmphasis: { fontFamily: "Quicksand_700Bold", color: COLORS.primary },
  photoBack: {
    position: "absolute",
    width: 178,
    height: 230,
    padding: 5,
    borderRadius: 24,
    backgroundColor: "#fff",
    shadowColor: "#382331",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 7,
    overflow: "hidden",
  },
  photoBackLeft: { left: "8%", top: "22%", transform: [{ rotate: "-10deg" }] },
  photoBackRight: { right: "6%", top: "17%", transform: [{ rotate: "10deg" }] },
  backImage: { width: "100%", height: "100%", borderRadius: 20 },
  matchCard: {
    position: "absolute",
    width: 204,
    height: 262,
    top: "18%",
    alignItems: "center",
    padding: 7,
    borderRadius: 26,
    backgroundColor: "#fff",
    shadowColor: "#382331",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 10,
  },
  matchImage: { width: "100%", height: 170, borderRadius: 20, backgroundColor: "#F3E6E7" },
  matchBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "#9C77E8" },
  matchBadgeText: { fontFamily: "Quicksand_700Bold", color: "#fff", fontSize: 10 },
  matchName: { fontFamily: "Quicksand_700Bold", color: COLORS.text, fontSize: 15, marginTop: 8 },
  matchDetail: { fontFamily: "Quicksand_500Medium", color: COLORS.muted, fontSize: 10, marginTop: 3 },
  reaction: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#382331",
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 5,
  },
  reactionHeart: { right: "14%", bottom: "18%" },
  reactionSparkle: { left: "10%", top: "25%" },
  reactionLike: { right: "11%", top: "37%" },
  chatPhotoCard: {
    position: "absolute",
    top: "6%",
    width: 188,
    height: 214,
    padding: 6,
    borderRadius: 26,
    backgroundColor: "#fff",
    transform: [{ rotate: "-7deg" }],
    shadowColor: "#382331",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 7,
  },
  chatPhoto: { width: "100%", height: "100%", borderRadius: 21 },
  chatBubbleOne: { position: "absolute", left: "5%", top: "42%", maxWidth: "72%", paddingHorizontal: 16, paddingVertical: 13, borderRadius: 20, borderBottomLeftRadius: 6, backgroundColor: "#fff", shadowColor: "#382331", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  chatBubbleTwo: { position: "absolute", right: "5%", top: "59%", maxWidth: "75%", paddingHorizontal: 16, paddingVertical: 13, borderRadius: 20, borderBottomRightRadius: 6, backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5 },
  chatText: { fontFamily: "Quicksand_600SemiBold", color: COLORS.text, fontSize: 13, lineHeight: 19 },
  chatTextLight: { fontFamily: "Quicksand_600SemiBold", color: "#fff", fontSize: 13, lineHeight: 19 },
  chatHeart: { position: "absolute", left: "22%", bottom: "11%", width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", elevation: 5 },
  chatAvatar: { position: "absolute", right: "19%", bottom: "8%", width: 68, height: 68, padding: 4, borderRadius: 34, backgroundColor: "#fff", elevation: 5 },
  chatAvatarImage: { width: "100%", height: "100%", borderRadius: 30 },
});
