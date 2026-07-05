import { View, ViewProps } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme/tokens';

type CardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
};

export function Card({ style, padded = true, elevated = true, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: padded ? spacing(4) : 0,
        },
        elevated ? shadow.card : { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
      {...rest}
    />
  );
}