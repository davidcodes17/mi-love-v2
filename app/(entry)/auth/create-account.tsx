import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Step1 from "@/components/modules/create-account/step-1";
import Step2 from "@/components/modules/create-account/step-2";
import Step3 from "@/components/modules/create-account/step-3";
import Step4 from "@/components/modules/create-account/step-4";
import Step5 from "@/components/modules/create-account/step-5";
import Step6 from "@/components/modules/create-account/step-6";
import Step7 from "@/components/modules/create-account/step-7";
import { useFormik } from "formik";
import authShema from "@/schema/auth";
import ThankYou from "./thank-you";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import Step8 from "@/components/modules/create-account/step-8";
import Step9 from "@/components/modules/create-account/step-9";
import Step10 from "@/components/modules/create-account/step-10";
import { COLORS } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const steps = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9, Step10];
const stepLabels = [
  "Email",
  "OTP",
  "Profile",
  "Interests",
  "Emergency",
  "Password",
  "Know You More",
  "Where You Are",
  "Who are you",
  "Thank You",
];

const initialValues = {
  email: "",
  otp: "",
  firstName: "",
  lastName: "",
  username: "",
  dob: "",
  country: "",
  phonenumber: "",
  interests: [],
  emergencyContact: "",
  password: "",
  confirmPassword: "",
  gender: "",
  bio: "",
  profileImage: "",
  home_address: "",
};

const CreateAccount = () => {
  const [step, setStep] = useState(0);
  const StepComponent = steps[step];
  const totalSteps = steps.length;

  const progress = useMemo(() => {
    if (totalSteps <= 1) return 1;
    return Math.min((step / (totalSteps - 1)) * 100, 100);
  }, [step, totalSteps]);

  const currentLabel = stepLabels[Math.min(step, stepLabels.length - 1)];

  const handleBackPress = () => {
    if (step === 0) {
      router.back();
    } else {
      back();
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: authShema[step],
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    },
  });

  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ThemedText fontSize={26} weight="bold" color={COLORS.primary}>
            Create your account
          </ThemedText>
          <ThemedText fontSize={14} color="#5F5F5F" marginTop={4}>
            Step {Math.min(step + 1, totalSteps)} of {totalSteps}
          </ThemedText>
        </View>
      </View>

      <View style={styles.progressWrapper}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressThumb, { width: `${progress}%` }]} />
        </View>
        <View style={styles.stepBadge}>
          <ThemedText fontSize={12} weight="bold" color={COLORS.primary}>
            {currentLabel}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.card}>
          <StepComponent
            values={formik.values}
            errors={formik.errors}
            touched={formik.touched}
            handleChange={(field) => (value) =>
              formik.setFieldValue(field, value)}
            handleBlur={formik.handleBlur}
            onNext={formik.handleSubmit}
            onBack={back}
            isLast={step === steps.length - 1}
            isFirst={step === 0}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  intro: {
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(93, 2, 1, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  progressWrapper: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#FAD7D5",
    overflow: "hidden",
  },
  progressThumb: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  stepBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(93, 2, 1, 0.08)",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(93, 2, 1, 0.08)",
    shadowColor: "#5d02011f",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
});
