import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Alert, AlertDescription } from '@/app.Commons/components/controls/alert';
import { Button } from '@/app.Commons/components/controls/button';
import { Input } from '@/app.Commons/components/controls/input';
import { Label } from '@/app.Commons/components/controls/label';
import { Text } from '@/app.Commons/components/controls/text';
import { useAssignPassword, type AssignPasswordResult } from '@/client-side.Commons/dataLayer/api/auth/assignPassword';
import { InitAppBackground } from '@/client-side.Impl/bootstrap/init-app-background';
import { AuthCard } from '@/client-side.Impl/userSession/auth-card';
import { Eye, EyeOff } from '@/components/ui/icons';

/**
 * The screen a password-reset / account-activation link opens: two password fields, checked
 * for "not empty" and "match", then sent to the server together with the link's key.
 *
 * It carries no navigator of its own: UserSessionProvider renders it in place of the whole
 * app. Leaving it — after the password is saved, or when the link turns out to be no good —
 * is the owner's job, through `onDone` (typically: forget the key, which lands on sign-in).
 */
export function AssignPasswordUI(props: { passwordResetKey: string; onDone?: () => void }) {
  return (
    <InitAppBackground>
      <AssignPasswordPage passwordResetKey={props.passwordResetKey} onDone={props.onDone} />
    </InitAppBackground>
  );
}

export function AssignPasswordPage(props: { passwordResetKey: string; onDone?: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<Extract<AssignPasswordResult, { ok: false }>>();
  const { assign, isLoading } = useAssignPassword(props.passwordResetKey);

  const onSubmit = async () => {
    setFailure(undefined); // an earlier answer must not linger while this one is in flight
    const result = await assign(password, confirmPassword);
    if (result.ok) {
      setSaved(true);
      props.onDone?.();
      return;
    }
    setFailure(result);
  };

  // With several rule explanations show them all; otherwise the one-line message says it.
  const details = failure && failure.passwordErrors.length > 1 ? failure.passwordErrors : undefined;

  if (saved) {
    return (
      <AuthCard title="Password saved">
        <Alert data-testid="assign-password-saved">
          <AlertDescription>Your password is set. Sign in with it to continue.</AlertDescription>
        </Alert>
        {props.onDone && (
          <Button className="w-full" onPress={props.onDone}>
            <Text>Go to sign in</Text>
          </Button>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set your password" description="Choose a password for your account.">
      <View className="gap-1.5">
        <Label>New password</Label>
        <View className="relative justify-center">
          <Input
            testID="assign-password-input"
            aria-label="New password"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            className="pr-9"
            value={password}
            onChangeText={setPassword}
            aria-invalid={!!failure && password === ''}
            autoFocus
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            accessibilityLabel={showPassword ? 'Hide passwords' : 'Show passwords'}
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

      <View className="gap-1.5">
        <Label>Repeat new password</Label>
        <Input
          testID="assign-password-confirm-input"
          aria-label="Repeat new password"
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          aria-invalid={!!failure && password !== confirmPassword}
        />
      </View>

      {failure && (
        <Alert variant="destructive" data-testid="assign-password-error">
          {details ? (
            <View className="gap-1">
              {details.map((message) => (
                <AlertDescription key={message}>• {message}</AlertDescription>
              ))}
            </View>
          ) : (
            <AlertDescription>{failure.message}</AlertDescription>
          )}
        </Alert>
      )}

      {failure?.keyRejected ? (
        // A refused key stays refused: the way forward is a new link, from the sign-in page.
        props.onDone && (
          <Button className="w-full" onPress={props.onDone}>
            <Text>Go to sign in</Text>
          </Button>
        )
      ) : (
        <Button
          testID="assign-password-submit-button"
          onPress={() => void onSubmit()}
          className="w-full"
          disabled={isLoading}
        >
          <Text>{isLoading ? 'Saving…' : 'Set password'}</Text>
        </Button>
      )}
    </AuthCard>
  );
}
