export const colors = {
  bg: '#F6FAF8',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF3F0',
  border: '#DCEAE3',

  primary: '#0F6E56',
  primaryDark: '#0B4A3A',
  primarySoft: '#E1F5EE',
  primarySoftStrong: '#C7ECDD',

  success: '#0F6E56',
  successSoft: '#E1F5EE',
  danger: '#993C1D',
  dangerSoft: '#FAECE7',
  warning: '#854F0B',
  warningSoft: '#FAEEDA',

  textPrimary: '#0B2B22',
  textSecondary: '#5F7A72',
  textTertiary: '#9CA8A2',

  onPrimary: '#FFFFFF',
  onPrimarySoft: '#B9E4D3',
};

export const radius = { sm: 8, md: 14, lg: 18, pill: 999 };

export const spacing = (n: number) => n * 4;

export const shadow = {
  card: {
    shadowColor: '#0B2B22',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};

export const typography = {
  h1: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  h2: { fontSize: 17, fontWeight: '700' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  bodyStrong: { fontSize: 15, fontWeight: '700' as const, color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textSecondary },
  captionStrong: { fontSize: 12, fontWeight: '700' as const, color: colors.textSecondary },
  micro: { fontSize: 10, fontWeight: '500' as const, color: colors.textPrimary },
  amountLg: { fontSize: 30, fontWeight: '800' as const, color: colors.onPrimary, letterSpacing: -0.5 },
};

export type TxKind = 'received' | 'sent' | 'topup';

export const txColors: Record<TxKind, { bg: string; fg: string; sign: '+' | '-' }> = {
  received: { bg: colors.successSoft, fg: colors.success, sign: '+' },
  sent: { bg: colors.dangerSoft, fg: colors.danger, sign: '-' },
  topup: { bg: colors.surfaceAlt, fg: colors.textSecondary, sign: '+' },
};