import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Alert, AlertDescription } from '@/app.Commons/components/controls/alert';
import { Button } from '@/app.Commons/components/controls/button';
import { Text } from '@/app.Commons/components/controls/text';
import { useRegisterUser } from '@/client-side.Commons/dataLayer/api/auth/accountApi';
import { getErrorMessage, getErrorStatus, getFieldErrors } from '@/client-side.Commons/dataLayer/core/apiError';
import { APP_CONFIG } from '@/client-side.Impl/config/app-config';
import { AuthCard, AuthField } from '@/client-side.Impl/userSession/auth-card';
import type { NoAuthNavigation } from '@/client-side.Impl/userSession/noauth-routes';

type FormValues = {
  UserName: string;
  Email: string;
  DisplayName: string;
  FullName: string;
  Phone: string;
};

const FIELDS: FieldPath<FormValues>[] = ['UserName', 'Email', 'DisplayName', 'FullName', 'Phone'];

// In UniqueEmail mode the e-mail is the login name and there is no user name to ask for.
const ASK_USER_NAME = APP_CONFIG.EmailMode !== 'UniqueEmail';

// Same shape the server accepts for a phone number (digits, space, + - ( ), 5–20 characters).
const PHONE_PATTERN = /^[\d +()-]{5,20}$/;

/**
 * Self-registration. The account starts out inactive: the server e-mails a link that opens
 * the "Set your password" screen, and setting the password there activates it.
 */
export function RegisterPage() {
  const navigation = useNavigation<NoAuthNavigation>();
  const [registerUser, registerState] = useRegisterUser();
  const { control, handleSubmit, setError } = useForm<FormValues>({
    defaultValues: { UserName: '', Email: '', DisplayName: '', FullName: '', Phone: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser({
        ...(ASK_USER_NAME ? { UserName: values.UserName.trim() } : {}),
        Email: values.Email.trim(),
        DisplayName: values.DisplayName.trim(),
        // Optional fields are left out when empty rather than sent as "".
        ...(values.FullName.trim() ? { FullName: values.FullName.trim() } : {}),
        ...(values.Phone.trim() ? { Phone: values.Phone.trim() } : {}),
      }).unwrap();
    } catch (error) {
      // 400 (invalid) and 409 (name or e-mail taken) both carry per-field explanations; put
      // each next to its field. Anything else is shown once, below.
      const fieldErrors = getFieldErrors(error);
      for (const field of FIELDS) {
        const message = fieldErrors[field]?.[0];
        if (message) setError(field, { type: 'server', message });
      }
    }
  });

  // Shown when the server's answer had nothing for a form field (network failure, rate limit, 5xx).
  const fieldErrors = registerState.isError ? getFieldErrors(registerState.error) : {};
  const generalError =
    registerState.isError && !FIELDS.some((field) => fieldErrors[field])
      ? getErrorStatus(registerState.error) === 429
        ? getErrorMessage(registerState.error, 'Too many attempts — please try again later')
        : getErrorMessage(registerState.error, 'Could not create the account — please try again')
      : undefined;

  const field = (
    name: FieldPath<FormValues>,
    label: string,
    rules: React.ComponentProps<typeof Controller<FormValues>>['rules'],
    inputProps: Partial<React.ComponentProps<typeof AuthField>> & { testID: string }
  ) => (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <AuthField
          label={label}
          error={error?.message}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          {...inputProps}
        />
      )}
    />
  );

  return (
    <AuthCard title="Create account">
      {registerState.isSuccess ? (
        <Alert data-testid="register-success">
          <AlertDescription>
            Almost done. We have sent you an email with a link to set your password — the account becomes active once
            you have done that.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {ASK_USER_NAME &&
            field(
              'UserName',
              'Username',
              { validate: (v) => v.trim() !== '' || 'Enter a username' },
              { testID: 'register-username-input', autoComplete: 'username', autoCapitalize: 'none', autoCorrect: false }
            )}
          {field(
            'Email',
            'Email',
            {
              validate: (v) => v.trim() !== '' || 'Enter your email',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
            },
            {
              testID: 'register-email-input',
              keyboardType: 'email-address',
              autoComplete: 'email',
              autoCapitalize: 'none',
              autoCorrect: false,
            }
          )}
          {field(
            'DisplayName',
            'Display name',
            { validate: (v) => v.trim() !== '' || 'Enter a display name' },
            { testID: 'register-display-name-input', autoComplete: 'nickname' }
          )}
          {field('FullName', 'Full name (optional)', undefined, {
            testID: 'register-full-name-input',
            autoComplete: 'name',
          })}
          {field(
            'Phone',
            'Phone (optional)',
            { validate: (v) => v.trim() === '' || PHONE_PATTERN.test(v.trim()) || 'Enter a valid phone number' },
            { testID: 'register-phone-input', keyboardType: 'phone-pad', autoComplete: 'tel' }
          )}

          {generalError && (
            <Alert variant="destructive">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <Button
            testID="register-submit-button"
            onPress={() => void onSubmit()}
            className="w-full"
            disabled={registerState.isLoading}
          >
            <Text>{registerState.isLoading ? 'Creating account…' : 'Create account'}</Text>
          </Button>
        </>
      )}

      <View className="flex-row items-center justify-center gap-1">
        <Text className="text-sm text-muted-foreground">Already have an account?</Text>
        <Button variant="link" size="sm" className="h-auto p-0" onPress={() => navigation.navigate('Login')}>
          <Text>Sign in</Text>
        </Button>
      </View>
    </AuthCard>
  );
}
