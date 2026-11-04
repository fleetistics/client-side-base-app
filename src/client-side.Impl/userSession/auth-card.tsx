import type { ComponentProps, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Input } from '@/app.Commons/components/controls/input';
import { Label } from '@/app.Commons/components/controls/label';
import { Text } from '@/app.Commons/components/controls/text';
import { APP_CONFIG } from '@/client-side.Impl/config/app-config';

/**
 * Shared frame for every no-auth page: app name, page title and the page's form. Scrolls, so
 * a tall form stays reachable on a small screen or with the keyboard open.
 */
export function AuthCard(props: { title: string; description?: string; children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      className="w-full flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow items-center justify-center p-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[360px] gap-4 rounded-lg border border-border bg-card p-8 shadow-sm">
          <View className="gap-1">
            <Text className="text-lg font-bold text-primary">{APP_CONFIG.APP_NAME || 'Console'}</Text>
            <Text className="text-xl font-semibold">{props.title}</Text>
            {props.description && <Text className="text-sm text-muted-foreground">{props.description}</Text>}
          </View>
          {props.children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type AuthFieldProps = ComponentProps<typeof Input> & {
  label: string;
  /** Explanation shown under the field; also marks it invalid. */
  error?: string;
};

/** Label, input and the field's error message — one row of a no-auth form. */
export function AuthField({ label, error, ...inputProps }: AuthFieldProps) {
  return (
    <View className="gap-1.5">
      <Label>{label}</Label>
      <Input aria-invalid={!!error} aria-label={label} {...inputProps} />
      {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
    </View>
  );
}
