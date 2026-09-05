/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/client-side.Commons/dataLayer/store';
import { UserSessionProvider } from '@/client-side.Commons/userSession/userSessionProvider';
import { MainRouter } from '@/navigator/main-router';
import { useColorScheme } from '@/uiColorScheme/useColorScheme';
import { useEffect } from 'react';
import { hideSplash } from 'react-native-splash-view';
import { InitAppStateListener } from '@/app.Commons/services/app-state-context';
import { MediaUploadService } from '@/app.Commons/services/media-uploader/mediaUploadService';
import { initLogger } from '@/app.Commons/services/logging/logger';
import { AppErrorBoundary } from '@/app.Impl/initComponents/app-error-boundary';
import { initI18n } from '@/client-side.Commons/i18n/i18n';
import { useTranslationUpdater } from '@/client-side.Commons/i18n/translationUpdater';
import { reactNativeI18nPlatform } from '@/app.Impl/services/i18n/platform';


function App() {
  const { isDarkColorScheme } = useColorScheme();
  useEffect(() => {
    initLogger();
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
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkColorScheme ? 'light-content' : 'dark-content'} />
          <UserSessionProvider>
            <MainRouter />
          </UserSessionProvider>
        </SafeAreaProvider>
      </Provider>
    </AppErrorBoundary>
  );
}

export default App;
