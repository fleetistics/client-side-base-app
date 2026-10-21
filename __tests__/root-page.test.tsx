import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { store } from '../src/client-side.Commons/dataLayer/core/store';
import { MainRouter } from '@/navigator/main-router';
import { GlobalToast } from '@/client-side.Commons/lib/global-toast';
import { GlobalAlert } from '@/client-side.Commons/lib/global-alert';
import { GlobalToastImpl } from '@/app.Commons/lib/global-toast-impl';
import { GlobalAlertImpl } from '@/app.Commons/lib/global-alert-impl';

// The router is rendered without App's session gate (which needs a server), exactly as App mounts it.
beforeEach(() => {
  jest.useFakeTimers();
  GlobalToast.SetInstance(new GlobalToastImpl());
  GlobalAlert.SetInstance(new GlobalAlertImpl());
});
afterEach(() => jest.useRealTimers());

test('RootPage opens on start and leads to CreateTeamPage', async () => {
  const errors = jest.spyOn(console, 'error');
  render(
    <Provider store={store}>
      <SafeAreaProvider>
        <MainRouter />
      </SafeAreaProvider>
    </Provider>
  );
  // MainRouter navigates to RootPage in NavigationContainer.onReady.
  expect(await screen.findByText('Create Team')).toBeTruthy();

  fireEvent.press(screen.getByText('Create Team'));
  expect(await screen.findByText('Team Setup')).toBeTruthy();
  await act(async () => {});

  expect(errors).not.toHaveBeenCalled();
});
