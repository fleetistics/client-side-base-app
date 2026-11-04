import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { Alert, AlertDescription } from '@/app.Commons/components/controls/alert';
import { Button } from '@/app.Commons/components/controls/button';
import { Text } from '@/app.Commons/components/controls/text';
import { useRequestPasswordReset } from '@/client-side.Commons/dataLayer/api/auth/accountApi';
import { getErrorMessage } from '@/client-side.Commons/dataLayer/core/apiError';
import { APP_CONFIG } from '@/client-side.Impl/config/app-config';
import { AuthCard, AuthField } from '@/client-side.Impl/userSession/auth-card';
import type { NoAuthNavigation } from '@/client-side.Impl/userSession/noauth-routes';

type FormValues = {
  Identifier: string;
};

const BY_EMAIL = APP_CONFIG.EmailMode === 'UniqueEmail';

/** Asks for a password-reset message. The link in it opens the "Set your password" screen. */
export function ResetPasswordPage() {
  const navigation = useNavigation<NoAuthNavigation>();
  const [requestReset, requestState] = useRequestPasswordReset();
  const { control, handleSubmit } = useForm<FormValues>({ defaultValues: { Identifier: '' } });

  const onSubmit = handleSubmit(async ({ Identifier }) => {
    try {
      await requestReset({ Identifier: Identifier.trim() }).unwrap();
    } catch {
      // Rendered below from requestState.error.
    }
  });

  return (
    <AuthCard
      title="Reset password"
      description={
        BY_EMAIL
          ? 'Enter your email and we will send you a link to reset your password.'
          : 'Enter your username and we will send a link to reset your password to the email address on the account.'
      }
    >
      {requestState.isSuccess ? (
        // The server answers the same whether or not an account matched, and so does this page.
        <Alert data-testid="reset-password-sent">
          <AlertDescription>
            If an account matches, a link to set a new password is on its way. It may take a few minutes to arrive.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Controller
            control={control}
            name="Identifier"
            rules={{
              validate: (v) => v.trim() !== '' || (BY_EMAIL ? 'Enter your email' : 'Enter your username'),
              ...(BY_EMAIL ? { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } } : {}),
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <AuthField
                label={BY_EMAIL ? 'Email' : 'Username'}
                error={error?.message}
                testID="reset-password-identifier-input"
                keyboardType={BY_EMAIL ? 'email-address' : 'default'}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={BY_EMAIL ? 'email' : 'username'}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />

          {requestState.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {getErrorMessage(requestState.error, 'Could not send the request — please try again')}
              </AlertDescription>
            </Alert>
          )}

          <Button
            testID="reset-password-submit-button"
            onPress={() => void onSubmit()}
            className="w-full"
            disabled={requestState.isLoading}
          >
            <Text>{requestState.isLoading ? 'Sending…' : 'Send reset link'}</Text>
          </Button>
        </>
      )}

      <Button variant="link" size="sm" className="h-auto self-center p-0" onPress={() => navigation.navigate('Login')}>
        <Text>Back to sign in</Text>
      </Button>
    </AuthCard>
  );
}
