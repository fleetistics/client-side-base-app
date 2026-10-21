import { StackActions } from '@react-navigation/native';

import { navigationRef } from '../../navigator/navigation-ref';

export function GlobalNavigateByString(name: string, params?: any) {
    if (navigationRef.isReady()) {
        // @ts-ignore
        navigationRef.navigate(name, params);
    }

}
export function GlobalNavigateBack() {
    if (navigationRef.isReady()) {
        if (navigationRef.canGoBack()) navigationRef.goBack();
        else navigationRef.dispatch(StackActions.replace('RootPage'));
    }
}
