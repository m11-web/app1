export const COLORS = {
  // Brand — warm orange (from logo)
  primary: '#C8591A',
  primaryDark: '#A04412',
  primaryLight: '#E07030',
  // Dark brown theme (default)
  bgDark: '#0F0804',
  cardDark: '#1C0E07',
  textDark: '#FFFFFF',
  textSecDark: '#A08060',
  borderDark: '#2E1808',
  inputBgDark: '#251008',
  // Light warm theme
  bgLight: '#FFF8F2',
  cardLight: '#FFFFFF',
  textLight: '#1A0C06',
  textSecLight: '#7A5038',
  borderLight: '#F0E0D0',
  inputBgLight: '#FFF4EC',
  // Status colours
  green500: '#22C55E',
  red500: '#EF4444',
  yellow400: '#FACC15',
  yellow700: '#A16207',
  purple500: '#A855F7',
  purple600: '#9333EA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  orange500: '#F97316',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#030712',
};

export type ThemeColors = {
  bg: string;
  card: string;
  text: string;
  textSec: string;
  border: string;
  inputBg: string;
};

export function getThemeColors(isDark: boolean): ThemeColors {
  return {
    bg: isDark ? COLORS.bgDark : COLORS.bgLight,
    card: isDark ? COLORS.cardDark : COLORS.cardLight,
    text: isDark ? COLORS.textDark : COLORS.textLight,
    textSec: isDark ? COLORS.textSecDark : COLORS.textSecLight,
    border: isDark ? COLORS.borderDark : COLORS.borderLight,
    inputBg: isDark ? COLORS.inputBgDark : COLORS.inputBgLight,
  };
}
