/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// App startup schedules module-level timers (splash hide, app-state init, translation
// polling) that would otherwise fire after the test environment is torn down.
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  // Unmount before teardown so late async results (e.g. the stubbed session fetch
  // rejecting) have nothing left to re-render.
  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });
});
