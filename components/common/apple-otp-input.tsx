import { View, Text } from 'react-native';
import { OTPInput, type SlotProps } from 'input-otp-native';
import type { OTPInputRef } from 'input-otp-native';
import { useRef, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
// import { cn } from './utils'; // Uncomment if you have a cn utility for classnames

interface AppleOTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  onComplete?: (code: string) => void;
}

export default function AppleOTPInput({ value, onChange, onBlur, maxLength = 4, onComplete }: AppleOTPInputProps) {
  const ref = useRef<OTPInputRef>(null);

  const handleComplete = (code: string) => {
    if (onComplete) {
      onComplete(code);
    } else {
      // Default: do nothing, or you can add an Alert here if you want
    }
    // Optionally clear after complete
    // ref.current?.clear();
  };

  return (
    <OTPInput
      ref={ref}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      maxLength={maxLength}
      onComplete={handleComplete}
      render={({ slots }) => (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 16 }}>
          {slots.map((slot, idx) => (
            <Slot key={idx} {...slot} />
          ))}
        </View>
      )}
    />
  );
}

function Slot({ char, isActive, hasFakeCaret }: SlotProps) {
  return (
    <View
      style={{
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? '#000' : '#e5e7eb',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginHorizontal: 2,
      }}
    >
      {char !== null && (
        <Text style={{ fontSize: 24, fontWeight: '500', color: '#111827' }}>{char}</Text>
      )}
      {hasFakeCaret && <FakeCaret />}
    </View>
  );
}

function FakeCaret() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle = {
    width: 2,
    height: 28,
    backgroundColor: '#000',
    borderRadius: 1,
  };

  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[baseStyle, animatedStyle]} />
    </View>
  );
} 