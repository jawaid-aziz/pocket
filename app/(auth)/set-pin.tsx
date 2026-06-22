import { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import PinPad from '@/src/components/PinPad';
import PinDots from '@/src/components/PinDots';
import { useSignup, useLoginNewDevice } from '@/src/api/hooks/useAuth';

const PIN_LENGTH = 6;

type Step = 'enter' | 'confirm';

export default function SetPinScreen() {
  const { phone, purpose, otpCode } = useLocalSearchParams<{
    phone: string;
    purpose: 'SIGNUP' | 'LOGIN_NEW_DEVICE';
    otpCode: string;
  }>();

  const [step, setStep] = useState<Step>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const signup = useSignup();
  const loginNewDevice = useLoginNewDevice();
  const isPending = signup.isPending || loginNewDevice.isPending;

  const currentPin = step === 'enter' ? pin : confirmPin;
  const setCurrentPin = step === 'enter' ? setPin : setConfirmPin;

  function handleDigit(digit: string) {
    if (currentPin.length >= PIN_LENGTH) return;
    const next = currentPin + digit;
    setCurrentPin(next);
    setError('');

    if (next.length === PIN_LENGTH) {
      if (step === 'enter') {
        // Move to confirm step
        setTimeout(() => setStep('confirm'), 200);
      } else {
        // Confirm step complete — check match
        if (pin !== next) {
          setError("PINs don't match. Try again.");
          setConfirmPin('');
          setStep('enter');
          setPin('');
          return;
        }
        submitWithPin(next);
      }
    }
  }

  function handleDelete() {
    setError('');
    setCurrentPin(currentPin.slice(0, -1));
  }

  function submitWithPin(finalPin: string) {
    if (purpose === 'SIGNUP') {
      signup.mutate(
        { phone, otpCode, pin: finalPin },
        {
          onSuccess: () => router.replace('/(tabs)' as any),
          onError: (err: any) => {
            setError(err.message || 'Something went wrong');
            setPin('');
            setConfirmPin('');
            setStep('enter');
          },
        }
      );
    } else {
      loginNewDevice.mutate(
        { phone, otpCode, pin: finalPin },
        {
          onSuccess: () => router.replace('/(tabs)' as any),
          onError: (err: any) => {
            setError(err.message || 'Something went wrong');
            setPin('');
            setConfirmPin('');
            setStep('enter');
          },
        }
      );
    }
  }

  return (
    <View className="flex-1 bg-primary items-center justify-center px-6">
      {/* Header */}
      <View className="items-center mb-2">
        <Text className="text-white text-2xl font-semibold">
          {step === 'enter' ? 'Set your PIN' : 'Confirm your PIN'}
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          {step === 'enter'
            ? 'Choose a 6-digit PIN to secure your wallet'
            : 'Enter the same PIN again to confirm'}
        </Text>
      </View>

      {/* PIN Dots */}
      <PinDots
        length={PIN_LENGTH}
        filled={currentPin.length}
        error={!!error}
      />

      {/* Error */}
      {error ? (
        <Text className="text-red-400 text-sm mb-4 text-center">{error}</Text>
      ) : null}

      {/* Loading */}
      {isPending ? (
        <ActivityIndicator color="#10B981" size="large" className="mb-4" />
      ) : null}

      {/* Pin Pad */}
      <PinPad onPress={handleDigit} onDelete={handleDelete} />
    </View>
  );
}