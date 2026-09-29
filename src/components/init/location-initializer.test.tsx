import { Text } from 'react-native';
import { Provider } from 'react-redux';
import { cleanup, installApiMock, jsonResponse, render, screen } from '@test-utils';
import { makeStore } from '@/client-side.Commons/dataLayer/core/store';
import { getOutbox } from '@/client-side.Commons/dataLayer/outbox/outbox';
import type { OutboxItem } from '@/client-side.Commons/dataLayer/outbox/outboxTypes';
import { LocationService } from '@/app.Commons/services/location/locationService';
import { LocationInitializer } from './location-initializer';

// Only LocationInitializer's own decision is under test, not BackgroundGeolocation wiring.
jest.mock('@/app.Commons/services/location/location-provider', () => ({
  LocationProvider: (props: { children: React.ReactNode }) => props.children,
}));

const PRIVACY_PATH = '/api/users/me/location-privacy';
const TEAM_PATH = '/api/users/me/active-team-id';

const pendingPrivate: OutboxItem = {
  operationId: 'op-private',
  endpointName: 'patchUserLocationPrivacy',
  args: { PrivacyMode: 1 },
  entityKeys: ['UserLocationPrivacy:ME'],
  userId: 7,
  createdAt: 1,
  status: 'pending',
  attempts: 1,
};

const outboxes: ReturnType<typeof getOutbox>[] = [];
afterEach(() => {
  outboxes.splice(0).forEach((o) => o.stop());
  cleanup();
  jest.restoreAllMocks();
});

async function renderWithQueue(queued: OutboxItem[]) {
  const setBoth = jest.spyOn(LocationService, 'SetBothPrivateMode_ReportLocationMode').mockImplementation(() => {});
  installApiMock({
    // The server still has the old, non-private value; the PATCH can't get through.
    [`GET ${PRIVACY_PATH}`]: () => jsonResponse({ PrivacyMode: 0, LatestUpdate: 1 }),
    [`GET ${TEAM_PATH}`]: () => jsonResponse(5),
    [`PATCH ${PRIVACY_PATH}`]: () => {
      throw new TypeError('Network request failed');
    },
  });
  const store = makeStore({ autoBatch: false });
  const outbox = getOutbox(store);
  outboxes.push(outbox);
  const data = new Map([['outbox.v1', JSON.stringify({ version: 1, items: queued })]]);
  void outbox.start({
    storage: { getItem: async (k) => data.get(k) ?? null, setItem: async (k, v) => void data.set(k, v) },
    getUserId: () => 7,
  });

  render(
    <Provider store={store}>
      <LocationInitializer>
        <Text>app content</Text>
      </LocationInitializer>
    </Provider>
  );
  await screen.findByText('app content');
  return setBoth;
}

describe('LocationInitializer privacy at startup', () => {
  it('applies a privacy choice still queued from before the restart over the server value', async () => {
    const setBoth = await renderWithQueue([pendingPrivate]);
    expect(setBoth).toHaveBeenCalledWith(true, true);
    expect(setBoth).not.toHaveBeenCalledWith(false, true);
  });

  it('applies the server value when nothing is queued', async () => {
    const setBoth = await renderWithQueue([]);
    expect(setBoth).toHaveBeenCalledWith(false, true);
  });
});
