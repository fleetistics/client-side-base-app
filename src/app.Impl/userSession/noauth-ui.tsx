import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InitAppBackground } from '@/app.Impl/initComponents/init-app-background';
import { LoginPage } from '@/app.Impl/userSession/login';

type NoAuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<NoAuthStackParamList>();

export function NoAuthUI(props: { reloadSessionFunc?: () => void }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {() => (
            <InitAppBackground>
              <LoginPage reloadSessionFunc={props.reloadSessionFunc} />
            </InitAppBackground>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
