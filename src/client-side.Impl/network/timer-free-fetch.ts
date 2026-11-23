// A fetch() that does not depend on JS timers, for requests that must complete while the app is
// in the background (the access-token refresh the location uploader waits for).
//
// Why: React Native's fetch is the whatwg-fetch polyfill, which resolves/rejects its promise inside
// setTimeout(..., 0) (node_modules/whatwg-fetch/dist/fetch.umd.js, xhr.onload/onerror/ontimeout/onabort).
// React Native stops JS timers while the host is paused (JavaTimerManager.onHostPause) unless a headless
// JS task is running. So in the background the HTTP response arrives natively and the server sees the
// request complete, but fetch()'s promise stays pending until the app returns to the foreground.
//
// This uses XMLHttpRequest directly: its events are delivered from native like any other native event
// (the plugin's onHttp event is delivered the same way), and `xhr.timeout` is enforced natively, so
// neither needs a JS timer.
//
// Limits: string (or no) request bodies only - that is all the refresh call sends - and the body is
// read as text. Do not use it for uploads or streaming.

const parseHeaders = (raw: string): Headers => {
  const headers = new Headers();
  raw
    .trim()
    .split(/[\r\n]+/)
    .forEach((line) => {
      const idx = line.indexOf(':');
      if (idx <= 0) return;
      const name = line.slice(0, idx).trim();
      if (name) headers.append(name, line.slice(idx + 1).trim());
    });
  return headers;
};

const abortError = () => Object.assign(new Error('Aborted'), { name: 'AbortError' });

let seq = 0;

export const createTimerFreeFetch =
  (timeoutMs: number): typeof fetch =>
  (input, init) =>
    new Promise<Response>((resolve, reject) => {
      const request = new Request(input as RequestInfo, init);
      const bodyInit = (request as unknown as { _bodyInit?: unknown })._bodyInit;
      if (bodyInit != null && typeof bodyInit !== 'string') {
        reject(new TypeError('timerFreeFetch: only string request bodies are supported'));
        return;
      }
      const signal = request.signal;
      if (signal?.aborted) {
        reject(abortError());
        return;
      }

      const id = ++seq;
      const t0 = Date.now();
      console.log(`[net-xhr #${id}] -> ${request.method} ${request.url}`);

      const xhr = new XMLHttpRequest();
      const onAbort = () => xhr.abort();
      const finish = () => signal?.removeEventListener('abort', onAbort);

      xhr.onload = () => {
        finish();
        console.log(`[net-xhr #${id}] <- ${xhr.status} ${request.url} in ${Date.now() - t0}ms`);
        resolve(
          new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
            url: xhr.responseURL || request.url,
          } as ResponseInit)
        );
      };
      xhr.onerror = () => {
        finish();
        console.warn(`[net-xhr #${id}] !! FAILED ${request.url} after ${Date.now() - t0}ms`);
        reject(new TypeError('Network request failed'));
      };
      xhr.ontimeout = () => {
        finish();
        console.warn(`[net-xhr #${id}] !! TIMEOUT ${request.url} after ${Date.now() - t0}ms`);
        reject(new TypeError('Network request timed out'));
      };
      xhr.onabort = () => {
        finish();
        reject(abortError());
      };

      xhr.open(request.method, request.url, true);
      request.headers.forEach((value, name) => xhr.setRequestHeader(name, value));
      xhr.responseType = 'text';
      xhr.withCredentials = request.credentials === 'include';
      xhr.timeout = timeoutMs;
      signal?.addEventListener('abort', onAbort);
      xhr.send(bodyInit == null ? null : bodyInit);
    });
