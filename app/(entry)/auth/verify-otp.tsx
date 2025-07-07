import { StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native'
import ThemedView, { ThemedText } from '@/components/ui/themed-view'
import BackButton from '@/components/common/back-button'
import NativeButton from '@/components/ui/native-button'
import AppleOTPInput from '@/components/common/apple-otp-input'
import { useRouter } from 'expo-router'

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView padding={20} flex={1}>
        <BackButton />
        <ThemedView marginTop={20}>
          <ThemedText fontSize={30} weight="semibold">
            Verify OTP
          </ThemedText>
          <ThemedText fontSize={16} color="#666" marginTop={8} lineHeight={22}>
            Enter the 6-digit code sent to your email address
          </ThemedText>
        </ThemedView>
        <ThemedView marginTop={40} alignItems="center">
          <AppleOTPInput
            value={otp}
            onChange={setOtp}
            maxLength={6}
          />
        </ThemedView>
        <ThemedView justifyContent="flex-end" alignItems="center" marginTop={40} marginBottom={20}>
          <NativeButton
            mode="fill"
            text="Verify"
            style={{ borderRadius: 100, width: '100%', height: 50 }}
            onPress={() => router.push('/auth/reset-password')}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  )
}

export default VerifyOtp

const styles = StyleSheet.create({})