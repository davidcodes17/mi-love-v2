import React, { useEffect, useState } from "react";
import { StyleSheet, Keyboard } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import AppleOTPInput from "@/components/common/apple-otp-input";
import NativeButton from "@/components/ui/native-button";
import { useSendOtp, useVerifyOtp } from "@/hooks/auth-hooks.hooks";
import toast from "@originaltimi/rn-toast";

interface Step2Props {
  values: any;
  errors: any;
  touched: any;
  handleChange: (field: string) => (value: any) => void;
  handleBlur: (field: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const Step2 = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  onNext,
  onBack,
  isFirst,
  isLast,
}: Step2Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60); // 60 seconds cooldown

  // Start countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0) {
      //@ts-ignore
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    try {
      setResendLoading(true);
      const response = await useSendOtp({ email: values.email });

      if (response?.message) {
        toast({
          title: "OTP Resent",
          type: "success",
          duration: 2000,
        });

        setTimer(60); // Reset timer
      } else {
        toast({
          title: response?.message || "Failed to resend OTP",
          type: "error",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast({
        title: error?.message || "Resend failed",
        type: "error",
        duration: 2000,
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      setLoading(true);

      const response = await useVerifyOtp({
        email: values?.email,
        otp: values?.otp,
      });

      Keyboard.dismiss();

      if (response?.id) {
        toast({
          title: "Email Verified Successfully",
          type: "success",
          position: "bottom",
          duration: 2000,
        });

        onNext();
      } else {
        toast({
          title: response?.message || "Invalid OTP",
          type: "error",
          position: "bottom",
          duration: 2000,
        });
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);

      toast({
        title: error?.message || "Verification failed",
        type: "error",
        position: "bottom",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView>
      <ThemedView marginBottom={20}>
        <BackButton />
        <ThemedText marginTop={20} fontSize={30}>
          Verify your email
        </ThemedText>
        <ThemedText marginTop={7}>
          We just sent an email to you with a verification code. Please enter
          the code below to verify your email address.
        </ThemedText>
      </ThemedView>

      <AppleOTPInput
        value={values.otp}
        onChange={handleChange("otp")}
        maxLength={6}
        onBlur={() => handleBlur("otp")}
      />

      {touched.otp && errors.otp && (
        <ThemedText color="red" marginTop={4}>
          {errors.otp}
        </ThemedText>
      )}

      <ThemedView
        width={"30%"}
        justifyContent="flex-end"
        alignSelf="flex-end"
        marginTop={20}
      >
        <NativeButton
          onPress={handleNext}
          isLoading={loading}
          text={isLast ? "Submit" : "Next"}
          mode="fill"
          style={{ borderRadius: 100 }}
        />
      </ThemedView>

      <ThemedView marginTop={30} alignItems="center">
        <NativeButton
          mode="text"
          text={timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
          onPress={handleResend}
          disabled={timer > 0 || resendLoading}
          isLoading={resendLoading}
        />
      </ThemedView>
    </ThemedView>
  );
};

export default Step2;

const styles = StyleSheet.create({});
