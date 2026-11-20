import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Pressable, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { MobileSessionKeyStore } from './MobileSessionKeyStore';
import { useNavigation } from '@react-navigation/native';
import { APP_CONFIG } from '@/client-side.Impl/config/app-config';
import { useLoginMutation } from '@/client-side.Commons/userSession/userSessionApi';
import { Alert, AlertDescription } from '@/app.Commons/components/controls/alert';
import { Button } from '@/app.Commons/components/controls/button';
import { Checkbox } from '@/app.Commons/components/controls/checkbox';
import { Input } from '@/app.Commons/components/controls/input';
import { Label } from '@/app.Commons/components/controls/label';
import { Text } from '@/app.Commons/components/controls/text';
import type { NoAuthNavigation } from '@/client-side.Impl/userSession/noauth-routes';
import { Eye, EyeOff } from '@/components/ui/icons';
import { MobileGpsDeviceProvider } from './mobile-gps-device-provider';
import { LoginRequestData } from '@/client-side.Commons/dataLayer/open-api/models/LoginRequestData';
import { ClientSideInfoProvider } from '@/client-side.Commons/userSession/ClientSideInfoProvider';
import { getErrorMessage, getErrorStatus } from '@/client-side.Commons/dataLayer/core/apiError';

// doEnableBiometry is a device-side choice: it is not part of LoginRequestData and is never sent to the server.
type FormValues = LoginRequestData & { doEnableBiometry: boolean };

/** Label of the biometry the device offers, named as the platform names it. */
function getBiometryLabel(type: Keychain.BIOMETRY_TYPE): string {
  const B = Keychain.BIOMETRY_TYPE;
  switch (type) {
    case B.FACE_ID: return 'Face ID';
    case B.TOUCH_ID: return 'Touch ID';
    case B.OPTIC_ID: return 'Optic ID';
    case B.FINGERPRINT: return 'fingerprint';
    case B.FACE: return 'face unlock';
    case B.IRIS: return 'iris scan';
    default: return Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'biometrics';
  }
}

export function LoginPage(props: { reloadSessionFunc?: () => void }) {
  const navigation = useNavigation<NoAuthNavigation>();
  const [showPassword, setShowPassword] = useState(false);
  // null = device has no (enrolled) biometrics: the checkbox is hidden.
  const [biometryType, setBiometryType] = useState<Keychain.BIOMETRY_TYPE | null>(null);
  const [login, loginState] = useLoginMutation();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { UserName: '', Password: '', RememberMe: true, doEnableBiometry: false },
  });

  useEffect(() => {
    setBiometryType(MobileSessionKeyStore.GetBiometryType());
  }, []);

  // handleSubmit skips the success callback without any signal when a `required` rule fails
  // (empty field, or an autofill/password manager that filled the native input without
  // firing onChangeText). Surface it instead of looking like a dead button.
  const [formError, setFormError] = useState<string | undefined>();

  const onSubmit = handleSubmit(async ({ doEnableBiometry, ...values }) => {
    setFormError(undefined);
    const t0 = Date.now();
    const lap = (step: string) => console.log(`[login] ${step} +${Date.now() - t0}ms`);
    try {
      lap('submit');
      values.GpsDeviceSerial = await MobileGpsDeviceProvider.GetDeviceSerialNumber();
      lap('GetDeviceSerialNumber done');
      await ClientSideInfoProvider.CheckInfoCollected ();
      lap('CheckInfoCollected done');
      values.ClientSideInfo = ClientSideInfoProvider.Info;
      // Set before the login: the session key is saved in this mode when the sign-in completes.

      const res = await login(values).unwrap();
      lap('login response received');
      if ( res.SessionKey && res.SessionSign && res.RotationCounter !== undefined) {
        await MobileSessionKeyStore.GetInstance().SaveSessionData(
          res.SessionKey,
          res.SessionSign,
          res.RotationCounter,
          doEnableBiometry
        );
      }
      // Re-runs the session check, which stores the token and swaps in the app UI.
      props.reloadSessionFunc?.();
    } catch (e) {
      // Rendered below from loginState.error.
      lap(`FAILED ${JSON.stringify(e)}`);
    }
  }, (errors) => {
    console.log(`[login] submit blocked by validation, invalid fields: ${Object.keys(errors).join(', ')}`);
    setFormError('Enter your username and password.');
  });

  // A mount/unmount pair that repeats means something above is swapping this screen out
  // (the "blinking"), which also resets the mutation state and hides the error.
  useEffect(() => {
    console.log('[login] LoginPage mounted');
    return () => console.log('[login] LoginPage unmounted');
  }, []);

  // The server's own message wins; the fallbacks apply only when it sent none. Network
  // failures (no response) are described by getErrorMessage from the original fetch error.
  const loginError = loginState.isError
    ? getErrorMessage(
        loginState.error,
        getErrorStatus(loginState.error) === 401
          ? 'Invalid username or password'
          : 'Sign in failed — please try again'
      )
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
              testID="login-username-input"
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
                testID="login-password-input"
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
              <Checkbox checked={!!value} onCheckedChange={onChange} />
            )}
          />
          <Label className="font-normal">Remember me</Label>
        </View>
        <Pressable onPress={() => navigation.navigate('ResetPassword')}>
          <Text className="text-sm text-primary">Forgot password?</Text>
        </Pressable>
      </View>

      {biometryType != null && (
        <View className="flex-row items-center gap-2">
          <Controller
            control={control}
            name="doEnableBiometry"
            render={({ field: { onChange, value } }) => (
              <Checkbox testID="login-biometry-checkbox" checked={value} onCheckedChange={onChange} />
            )}
          />
          <Label className="font-normal">Use {getBiometryLabel(biometryType)} to unlock the app</Label>
        </View>
      )}

      {(formError ?? loginError) && (
        <Alert variant="destructive">
          <AlertDescription>{formError ?? loginError}</AlertDescription>
        </Alert>
      )}

      <Button testID="login-submit-button" onPress={() => { console.log(`[login] Sign in pressed, isLoading=${loginState.isLoading}`); void onSubmit(); }} className="w-full" disabled={loginState.isLoading}>
        <Text>{loginState.isLoading ? 'Signing in…' : 'Sign in'}</Text>
      </Button>

      <View className="flex-row items-center justify-center gap-1">
        <Text className="text-sm text-muted-foreground">Don't have an account?</Text>
        <Button variant="link" size="sm" className="h-auto p-0" onPress={() => navigation.navigate('Register')}>
          <Text>Create account</Text>
        </Button>
      </View>
    </View>
  );
}
