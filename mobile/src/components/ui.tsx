import React, { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = {
  green: '#246C4F',
  ink: '#203129',
  muted: '#64746B',
  pale: '#EDF6EF',
  line: '#E3EAE4',
  bg: '#FAFBF9',
  warning: '#855728',
};
export function Page({
  children,
  title,
  subtitle,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <SafeAreaView style={s.safe} edges={['left', 'right', 'top']}>
      <KeyboardAvoidingView
        style={s.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.page}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <Text style={s.brand}>e. EAT LAH</Text>
          <Text accessibilityRole="header" style={s.title}>
            {title}
          </Text>
          {subtitle ? <Text style={s.muted}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Card({ children }: PropsWithChildren) {
  return <View style={s.card}>{children}</View>;
}
export function Heading({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="header" style={s.heading}>
      {children}
    </Text>
  );
}
export function Note({ children }: PropsWithChildren) {
  return <Text style={s.note}>{children}</Text>;
}
export function Body({ children }: PropsWithChildren) {
  return <Text style={s.body}>{children}</Text>;
}
export function Row({ children }: PropsWithChildren) {
  return <View style={s.row}>{children}</View>;
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  testID,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (pressed || disabled) && { opacity: 0.5 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: colors.green }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[s.chip, selected && s.selected]}
    >
      <Text style={{ color: selected ? colors.green : colors.muted }}>
        {selected ? '✓ ' : ''}
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8B968E"
        style={s.input}
        {...props}
      />
    </View>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <Card>
      <Text style={s.muted}>{text}</Text>
    </Card>
  );
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  brand: {
    color: colors.green,
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 13,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.8,
  },
  heading: { fontSize: 19, fontWeight: '600', color: colors.ink },
  body: { fontSize: 15, lineHeight: 24, color: colors.ink },
  muted: { fontSize: 14, lineHeight: 23, color: colors.muted },
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'white',
    borderColor: colors.line,
    borderWidth: 1,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 18,
    backgroundColor: colors.green,
  },
  secondary: { backgroundColor: colors.pale },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  chip: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  selected: { borderColor: colors.green, backgroundColor: colors.pale },
  label: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  input: {
    minHeight: 48,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    color: colors.ink,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  note: { fontSize: 12, lineHeight: 20, color: colors.muted },
});
