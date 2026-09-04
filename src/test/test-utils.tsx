import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import { makeStore } from '@/app.Commons/dataLayer/store';

export * from '@testing-library/react-native';

/** Renders `ui` inside a fresh Redux store so RTK Query's cache never leaks between tests. */
export function renderApp(ui: ReactElement) {
  return render(<Provider store={makeStore({ autoBatch: false })}>{ui}</Provider>);
}

export type MockRequest = {
  method: string;
  pathname: string;
  url: string;
  body: unknown;
};

type MockHandler = (req: MockRequest) => Response | Promise<Response>;

/** Builds a Response the way fetchBaseQuery expects to receive one. */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Stubs global.fetch for one test. Handlers are keyed "METHOD /pathname" — fetchBaseQuery
 * reads `fetch` off the global scope fresh on every call (it's a free-variable lookup, not
 * a captured reference), so reassigning it per test is enough even though apiSlice's own
 * base query is a lazily-created, file-scoped singleton shared across tests.
 */
export function installApiMock(handlers: Record<string, MockHandler>) {
  const requests: MockRequest[] = [];

  // fetchBaseQuery always calls fetchFn with a single already-built `Request` (it does
  // `new Request(url, config)` itself), never the (url, init) pair fetch also accepts.
  const fetchMock = jest.fn(async (rawRequest: Request) => {
    const url = rawRequest.url;
    const method = rawRequest.method.toUpperCase();
    const rawBody = await rawRequest.text();
    let body: unknown = rawBody;
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    }

    const pathname = new URL(url).pathname;
    const req: MockRequest = { method, pathname, url, body };
    requests.push(req);

    const key = `${method} ${pathname}`;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`installApiMock: no handler registered for "${key}" (requested ${url})`);
    }
    return handler(req);
  });

  globalThis.fetch = fetchMock as unknown as typeof fetch;

  return { requests, fetchMock };
}
