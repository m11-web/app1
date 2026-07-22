import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface Props {
  title: string;
  right?: React.ReactNode;
  dark?: boolean;
}

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

export default function BackHeader({ title, right, dark }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();

  const bgColor = dark ? COLORS.primary : isDark ? COLORS.cardDark : COLORS.cardLight;
  const textColor = dark ? '#fff' : isDark ? '#fff' : COLORS.gray900;
  const btnBg = dark ? 'rgba(255,255,255,0.2)' : isDark ? COLORS.gray800 : COLORS.gray100;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: STATUS_BAR_HEIGHT + 8 }]}>
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : router.replace('/')}  
        style={[styles.backBtn, { backgroundColor: btnBg }]}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={styles.rightSlot}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  rightSlot: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
});
