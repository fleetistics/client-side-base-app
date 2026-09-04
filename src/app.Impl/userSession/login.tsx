import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { APP_CONFIG } from '@/app.Impl/configs/app-config';
import { useLoginMutation } from '@/app.Commons/userSession/userSessionApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Eye, EyeOff } from '@/lib/icons';

type FormValues = {
  UserName: string;
  Password: string;
  RememberMe: boolean;
};

export function LoginPage(props: { reloadSessionFunc?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [login, loginState] = useLoginMutation();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { UserName: '', Password: '', RememberMe: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values).unwrap();
      // Re-runs the session check, which stores the token and swaps in the app UI.
      props.reloadSessionFunc?.();
    } catch {
      // Rendered below from loginState.error.
    }
  });

  const loginError = loginState.isError
    ? (loginState.error as { status?: unknown }).status === 401
      ? 'Invalid username or password'
      : 'Sign in failed — please try again'
    : undefined;

  return (
    <View className="w-[360px] gap-4 rounded-lg border border-border bg-card p-8 shadow-sm">
      <View>
        <Text className="text-lg font-bold text-primary">{APP_CONFIG.APP_NAME || 'Console'}</Text>
        <Text className="text-sm text-muted-foreground">Development Console</Text>
      </View>

      <Text className="text-xl font-semibold">Sign in</Text>

      <View className="gap-1">
        <Label>Username</Label>
        <Controller
          control={control}
          name="UserName"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              autoComplete="username"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
      </View>

      <View className="gap-1">
        <Label>Password</Label>
        <View className="relative justify-center">
          <Controller
            control={control}
            name="Password"
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                className="pr-9"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-2 items-center justify-center"
          >
            {showPassword ? (
              <EyeOff size={18} className="text-muted-foreground" />
            ) : (
              <Eye size={18} className="text-muted-foreground" />
            )}
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Controller
            control={control}
            name="RememberMe"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onCheckedChange={onChange} />
            )}
          />
          <Label className="font-normal">Remember me</Label>
        </View>
        <Pressable>
          <Text className="text-sm text-primary">Forgot password?</Text>
        </Pressable>
      </View>

      {loginError && (
        <Alert variant="destructive">
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      <Button onPress={() => onSubmit()} className="w-full" disabled={loginState.isLoading}>
        <Text>{loginState.isLoading ? 'Signing in…' : 'Sign in'}</Text>
      </Button>
    </View>
  );
}
