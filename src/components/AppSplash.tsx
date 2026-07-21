import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');
const TAGLINE = 'Natural Beauty • Pure Henna Products';

interface Props {
  onDone: () => void;
}

export default function AppSplash({ onDone }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const [typedText, setTypedText] = useState('');
  const typingDone = useRef(false);

  useEffect(() => {
    // 1. Fade + scale in the logo
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: false,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // 2. Show tagline container
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // 3. Type out tagline letter by letter
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setTypedText(TAGLINE.slice(0, i));
          if (i >= TAGLINE.length) {
            clearInterval(interval);
            typingDone.current = true;
            // 4. Wait then fade out splash
            setTimeout(() => {
              Animated.timing(screenOpacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: false,
              }).start(onDone);
            }, 600);
          }
        }, 38);
      });
    });
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Logo block */}
      <Animated.View style={[styles.logoBlock, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🛍️</Text>
        </View>

        {/* Brand name — matches logo style */}
        <View style={styles.brandRow}>
          <Text style={styles.brandRena}>Rena</Text>
          <Text style={styles.brandHenna}>Henna</Text>
        </View>
      </Animated.View>

      {/* Typing tagline */}
      <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
        <Text style={styles.tagline}>
          {typedText}
          <Text style={styles.cursor}>|</Text>
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  circle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(200,89,26,0.08)',
  },
  circle2: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(200,89,26,0.06)',
  },
  circle3: {
    position: 'absolute',
    top: '40%',
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(200,89,26,0.05)',
  },
  logoBlock: {
    alignItems: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  iconEmoji: {
    fontSize: 40,
  },
  brandRow: {
    flexDirection: 'row',
    gap: 0,
  },
  brandRena: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandHenna: {
    color: COLORS.primary,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  taglineWrap: {
    marginTop: 28,
    paddingHorizontal: 32,
    minHeight: 22,
  },
  tagline: {
    color: COLORS.textSecDark,
    fontSize: 13,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  cursor: {
    color: COLORS.primary,
    fontWeight: '300',
  },
});
