/**
 * Bouton principal réutilisable — Style SOLUL
 * Fond doré, texte blanc, coins arrondis
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors, FontSize, BorderRadius, Spacing } from '../../constants';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'filled' | 'outline';
}

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = 'filled',
}: PrimaryButtonProps) {
  const isFilled = variant === 'filled';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFilled ? styles.filled : styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? Colors.textLight : Colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            isFilled ? styles.filledText : styles.outlineText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  filled: {
    backgroundColor: Colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  filledText: {
    color: Colors.textLight,
  },
  outlineText: {
    color: Colors.primary,
  },
});
