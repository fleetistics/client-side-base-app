/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/client-side.Commons/dataLayer/core/store';
import { UserSessionProvider } from '@/client-side.Commons/userSession/userSessionProvider';
import { MainRouter } from '@/navigator/main-router';
import { useColorScheme } from '@/uiColorScheme/useColorScheme';
import { useEffect } from 'react';
import { hideSplash } from 'react-native-splash-view';
import { InitAppStateListener } from '@/app.Commons/services/app-state-context';
import { MediaUploadService } from '@/app.Commons/services/media-uploader/mediaUploadService';
import { initLogger } from '@/app.Commons/services/logging/logger';
import { initCrashReporting } from '@/app.Commons/services/crashReporting/crashReporting';
import { AppErrorBoundary } from '@/app.Impl/initComponents/app-error-boundary';
import { initI18n } from '@/client-side.Commons/i18n/i18n';
import { useTranslationUpdater } from '@/client-side.Commons/i18n/translationUpdater';
import { reactNativeI18nPlatform } from '@/app.Impl/services/i18n/platform';
import { LocationInitializer } from '@/components/init/location-initializer';
import { User } from 'lucide-react-native';
import { UserSettingsProvider } from '@/client-side.Commons/components/init/user-settings-provider';
import { setE2EMode, isE2EMode } from '@/app.Impl/testSupport/e2e-mode';
import { E2EMockLocation } from '@/app.Impl/testSupport/e2e-mock-location';

type AppProps = {
  // Only ever set by Detox's launchArgs, forwarded as initialProps via MainActivity.kt's
  // getLaunchOptions() override — absent (undefined) in every real launch.
  e2eMockMap?: string;
};

function App({ e2eMockMap }: AppProps) {
  setE2EMode(e2eMockMap === 'true');
  const { isDarkColorScheme } = useColorScheme();
  useEffect(() => {
    initLogger();
    void initCrashReporting();
    console.log('Start App');
    InitAppStateListener();
    MediaUploadService.Create();
    void initI18n(reactNativeI18nPlatform, { testMode: true });
    setTimeout(() => {
      hideSplash();
    }, 4000);
  }, []);

  // Background translation refresh — mount once at the app root, after the initI18n()
  // call above (declared first, so its effect registers the platform before this one runs).
  useTranslationUpdater();

  return (
    <AppErrorBoundary>
      <Provider store={store}>
        {isE2EMode() && <E2EMockLocation />}
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkColorScheme ? 'light-content' : 'dark-content'} />
          <UserSessionProvider mockSession={isE2EMode() ? { UserId: -1, SessionId: -1, PlatformId: 1 } : undefined}>
            <UserSettingsProvider skipBlocking={isE2EMode()}>
              <LocationInitializer>
                <MainRouter />
              </LocationInitializer>
            </UserSettingsProvider>
          </UserSessionProvider>
        </SafeAreaProvider>
      </Provider>
    </AppErrorBoundary>
  );
}

export default App;
