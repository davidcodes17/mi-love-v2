import { StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native'
import ThemedView, { ThemedText } from '@/components/ui/themed-view'
import BackButton from '@/components/common/back-button'
import InputField from '@/components/common/input-field'
import NativeButton from '@/components/ui/native-button'
import { Lock } from 'iconsax-react-native'

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView padding={20} flex={1}>
        <BackButton />
        <ThemedView marginTop={20}>
          <ThemedText fontSize={30} weight="semibold">
            Reset Password
          </ThemedText>
          <ThemedText fontSize={16} color="#666" marginTop={8} lineHeight={22}>
            Enter your new password below.
          </ThemedText>
        </ThemedView>
        <ThemedView marginTop={40}>
          <InputField
            icon={<Lock size={20} color="#ddd" />}
            label="New Password"
            placeholder="Enter new password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <InputField
            icon={<Lock size={20} color="#ddd" />}
            label="Confirm Password"
            placeholder="Re-enter new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            
          />
        </ThemedView>
        <ThemedView justifyContent="flex-end" alignItems="center" marginTop={40} marginBottom={20}>
          <NativeButton
            mode="fill"
            text="Reset Password"
            style={{ borderRadius: 100, width: '100%', height: 50 }}
            // onPress={...}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  )
}

export default ResetPassword

const styles = StyleSheet.create({})