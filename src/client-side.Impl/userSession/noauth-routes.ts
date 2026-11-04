import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/** Screens a signed-out user can reach. */
export type NoAuthStackParamList = {
  Login: undefined;
  ResetPassword: undefined;
  Register: undefined;
};

export type NoAuthNavigation = NativeStackNavigationProp<NoAuthStackParamList>;
