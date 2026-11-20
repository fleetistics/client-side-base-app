import type { ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InitAppBackground } from '@/client-side.Impl/bootstrap/init-app-background';
import { USER_SESSION_CONSTS } from '@/client-side.Impl/config/userSession-consts';
import { AutoLoginPage } from '@/client-side.Impl/userSession/auto-login';
import { LoginPage } from '@/client-side.Impl/userSession/login';
import type { NoAuthStackParamList } from '@/client-side.Impl/userSession/noauth-routes';
import { RegisterPage } from '@/client-side.Impl/userSession/register';
import { ResetPasswordPage } from '@/client-side.Impl/userSession/reset-password';

const Stack = createNativeStackNavigator<NoAuthStackParamList>();

const WithBackground = (props: { children: ReactNode }) => <InitAppBackground>{props.children}</InitAppBackground>;

/** Everything a signed-out user can see: sign-in, and from there registration and password reset. */
export function NoAuthUI(props: { reloadSessionFunc?: () => void }) {
  // Auto-login mode has no sign-in form: the device signs itself in.
  if (USER_SESSION_CONSTS.AUTO_LOGIN_MODE) {
    return <AutoLoginPage reloadSessionFunc={props.reloadSessionFunc} />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {() => (
            <WithBackground>
              <LoginPage reloadSessionFunc={props.reloadSessionFunc} />
            </WithBackground>
          )}
        </Stack.Screen>
        <Stack.Screen name="ResetPassword">
          {() => (
            <WithBackground>
              <ResetPasswordPage />
            </WithBackground>
          )}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {() => (
            <WithBackground>
              <RegisterPage />
            </WithBackground>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
