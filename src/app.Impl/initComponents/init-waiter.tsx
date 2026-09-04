import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { InitAppBackground } from './init-app-background';


export type InitWaiterProps = {
  children?: ReactNode;
  loadingLabel?: string;
};

export function InitWaiter(props: InitWaiterProps) {
  return (
    <InitAppBackground>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <ActivityIndicator size="large" />
        <Text>{props.loadingLabel ?? 'Loading...'}</Text>
      </View>
    </InitAppBackground>
  );
}
