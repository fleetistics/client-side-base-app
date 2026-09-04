import * as React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { appPages, NavigatorPages } from './pages-config';
import { navigationRef } from './navigation-ref';
import { useColorScheme } from '@/lib/useColorScheme';
import { NAV_THEME } from '@/lib/constants';

const Stack = createNativeStackNavigator<NavigatorPages>();

export function MainRouter() {
    let pages = appPages;
    const previousRouteName = React.useRef<string | undefined>(undefined);
    const { colorScheme } = useColorScheme();

    return (
        <NavigationContainer
            theme={NAV_THEME[colorScheme]}
            ref={navigationRef}
            onReady={() => {
                navigationRef.current?.navigate('RootPage');
            }}
            onStateChange={(state) => {
                let currentRouteName = state?.routes[state.index]?.name;
                if (currentRouteName != null && currentRouteName !== previousRouteName.current) {
                    let logMsg = `Navigated: ${previousRouteName.current ?? '(none)'} -> ${currentRouteName}`;
                    console.log(logMsg);
                    previousRouteName.current = currentRouteName;
                }
            }}
        >
            <View style={{ flex: 1 }}>
                <Stack.Navigator id="MainStack" screenOptions={{ animation: 'slide_from_right', headerShown: false, gestureEnabled: true }}  >
                    {
                        pages.map(item => {
                            return <Stack.Screen key={item.name!} name={item.name!} component={item.component!} options={item.options} initialParams={item.initialParams} />
                        })
                    }
                </Stack.Navigator>
            </View>
        </NavigationContainer>
    );
}
