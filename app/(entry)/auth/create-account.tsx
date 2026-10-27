import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  BackHandler,
  Text,
} from "react-native";
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
import Step8 from "@/components/modules/create-account/step-8";
import Step9 from "@/components/modules/create-account/step-9";
import Step10 from "@/components/modules/create-account/step-10";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { IG } from "@/components/styles/onboarding-styles";

const steps = [
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  Step6,
  Step7,
  Step8,
  Step9,
  Step10,
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
  const navigation = useNavigation();
  const StepComponent = steps[step];
  const totalSteps = steps.length;

  const back = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const progress = useMemo(() => {
    if (totalSteps <= 1) return 1;
    return Math.min(((step + 1) / totalSteps) * 100, 100);
  }, [step, totalSteps]);

  const handleBackPress = () => {
    if (step === 0) router.back();
    else back();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (step === 0) return;
      e.preventDefault();
      back();
    });
    return unsubscribe;
  }, [navigation, step, back]);

  useEffect(() => {
    const onBackPress = () => {
      if (step > 0) {
        back();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [step, back]);

  const formik = useFormik({
    initialValues,
    validationSchema: authShema[step],
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={28} color={IG.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Sign up</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressThumb, { width: `${progress}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IG.bg,
  },
  topBar: {
    minHeight: 58,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: IG.text,
  },
  progressTrack: {
    height: 4,
    marginHorizontal: 18,
    borderRadius: 999,
    backgroundColor: IG.border,
    overflow: "hidden",
  },
  progressThumb: {
    height: "100%",
    backgroundColor: IG.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
});
