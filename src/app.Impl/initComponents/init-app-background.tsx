import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export function InitAppBackground(props: { children?: ReactNode }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('../../../assets/images/app-background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="center"
      />
      {props.children}
    </View>
  );
}
