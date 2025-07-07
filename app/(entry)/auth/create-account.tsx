import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalStyles from "@/components/styles/global-styles";
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
import { ThemedText } from "@/components/ui/themed-view";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Step8 from "@/components/modules/create-account/step-8";
import Step9 from "@/components/modules/create-account/step-9";
import Step10 from "@/components/modules/create-account/step-10";

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
  fullName: "",
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

const accent = "#7B61FF";
const accentGradient = ["#7B61FF", "#A084FF"];

const CreateAccount = () => {
  const [step, setStep] = useState(0);
  const StepComponent = steps[step];

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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
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
      </View>
    </SafeAreaView>
  );
};

export default CreateAccount;
const styles = StyleSheet.create({});
