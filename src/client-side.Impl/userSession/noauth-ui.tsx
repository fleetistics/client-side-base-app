import type { ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InitAppBackground } from '@/client-side.Impl/bootstrap/init-app-background';
import { LoginPage } from '@/client-side.Impl/userSession/login';
import type { NoAuthStackParamList } from '@/client-side.Impl/userSession/noauth-routes';
import { RegisterPage } from '@/client-side.Impl/userSession/register';
import { ResetPasswordPage } from '@/client-side.Impl/userSession/reset-password';

const Stack = createNativeStackNavigator<NoAuthStackParamList>();

const WithBackground = (props: { children: ReactNode }) => <InitAppBackground>{props.children}</InitAppBackground>;

/** Everything a signed-out user can see: sign-in, and from there registration and password reset. */
export function NoAuthUI(props: { reloadSessionFunc?: () => void }) {
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
