/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/app.Commons/dataLayer/store';
import { UserSessionProvider } from '@/app.Commons/userSession/userSessionProvider';
import { MainRouter } from '@/navigator/main-router';
import { useColorScheme } from '@/lib/useColorScheme';
import { useEffect } from 'react';
import { hideSplash } from 'react-native-splash-view';
import { InitAppStateListener } from '@/app.Impl/services/app-state-context';
import { MediaUploadService } from '@/app.Impl/services/media-uploader/mediaUploadService';
import { initLogger } from '@/app.Impl/services/logging/logger';
import { AppErrorBoundary } from '@/app.Impl/initComponents/app-error-boundary';


function App() {
  const { isDarkColorScheme } = useColorScheme();
  useEffect(() => {
    initLogger();
    console.log('Start App');
    InitAppStateListener();
    MediaUploadService.Create();
    setTimeout(() => {
      hideSplash();
    }, 4000);
  }, []);

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
