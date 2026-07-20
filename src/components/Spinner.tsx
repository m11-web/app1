import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface SpinnerProps {
  size?: number;
  color?: string;
}

export default function Spinner({ size = 32, color = COLORS.primary }: SpinnerProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(2, size / 8),
          borderColor: color,
        },
        { transform: [{ rotate: spin }] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderTopColor: 'transparent',
  },
});
