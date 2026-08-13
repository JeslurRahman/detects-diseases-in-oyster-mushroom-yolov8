/** Dropdown — generic single-select using a Paper Menu anchored to a field. */
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Menu } from 'react-native-paper';

import { useAppTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

export interface DropdownOption {
  label: string;
  value: number | string;
}

interface Props {
  options: DropdownOption[];
  value: number | string | null;
  onChange: (value: number | string) => void;
  placeholder?: string;
}

export function Dropdown({ options, value, onChange, placeholder }: Props) {
  const { colors, radius, spacing } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      contentStyle={{ backgroundColor: colors.surface, borderRadius: radius.md }}
      anchor={
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            minWidth: 150,
            gap: spacing.sm,
          }}
        >
          <AppText variant="bodyStrong" color={selected ? 'text' : 'textFaint'}>
            {selected?.label ?? placeholder ?? 'Select'}
          </AppText>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>
      }
    >
      {options.map((opt) => (
        <Menu.Item
          key={String(opt.value)}
          onPress={() => {
            onChange(opt.value);
            setOpen(false);
          }}
          title={opt.label}
          titleStyle={{ color: colors.text }}
        />
      ))}
    </Menu>
  );
}
