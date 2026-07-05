import { View, Text } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../theme/tokens';

type Props = {
  deviceName: string;
  online: boolean;
  lastAnnouncement?: string;
};

export function SoundBoxStatusCard({ deviceName, online, lastAnnouncement }: Props) {
  return (
    <View
      style={{
        backgroundColor: colors.primarySoft,
        borderRadius: radius.md,
        padding: spacing(3),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.primarySoftStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Volume2 size={18} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontWeight: '700', fontSize: 13, color: colors.textPrimary }}>{deviceName}</Text>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: online ? colors.primary : colors.textTertiary,
            }}
          />
          <Text style={{ fontSize: 11, color: online ? colors.primary : colors.textTertiary }}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
        {lastAnnouncement ? (
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{lastAnnouncement}</Text>
        ) : null}
      </View>
    </View>
  );
}