import { View, Text, Pressable } from 'react-native';
import { ArrowDown, ArrowUp, QrCode, Receipt } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme/tokens';

type Action = {
  label: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  comingSoon?: boolean;
};

export function QuickActions() {
  const router = useRouter();

  const actions: Action[] = [
    { label: 'Load', icon: ArrowDown, onPress: () => router.push('/(tabs)/load' as any) },
    { label: 'Send', icon: ArrowUp, onPress: () => router.push('/(tabs)/send' as any) },
    { label: 'Scan', icon: QrCode, onPress: () => {}, comingSoon: true },
    { label: 'Request', icon: Receipt, onPress: () => {}, comingSoon: true },
  ];

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {actions.map(({ label, icon: Icon, onPress, comingSoon }) => (
        <Pressable
          key={label}
          onPress={onPress}
          style={{ alignItems: 'center', gap: 4, opacity: comingSoon ? 0.5 : 1 }}
          accessibilityLabel={comingSoon ? `${label} - coming soon` : label}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 10, color: colors.textPrimary, fontWeight: '500' }}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}