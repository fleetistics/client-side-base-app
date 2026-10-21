import type { NavigatorPages } from '../../navigator/pages-config';
import { navigationRef } from '../../navigator/navigation-ref';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);
export function GlobalNavigate(name: keyof NavigatorPages, params?: any) {
    if (navigationRef.isReady()) {
        // @ts-ignore
        navigationRef.navigate(name, params);
    }

}
export function GetCurrentRoute() {
    if (navigationRef.isReady()) {
        return navigationRef.getCurrentRoute();
    }
}