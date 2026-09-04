import { createNavigationContainerRef } from '@react-navigation/native';
import type { NavigatorPages } from './pages-config';

export const navigationRef = createNavigationContainerRef<NavigatorPages>();
