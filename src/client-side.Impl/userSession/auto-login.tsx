import { useCallback, useEffect, useRef, useState } from 'react';
import { InitError } from '@/client-side.Impl/bootstrap/init-error';
import { InitWaiter } from '@/client-side.Impl/bootstrap/init-waiter';
import { useLoginMutation } from '@/client-side.Commons/userSession/userSessionApi';
import { LoginRequestData } from '@/client-side.Commons/dataLayer/open-api/models/LoginRequestData';
import { ClientSideInfoProvider } from '@/client-side.Commons/userSession/ClientSideInfoProvider';
import { getErrorMessage } from '@/client-side.Commons/dataLayer/core/apiError';
import { AutoLoginProvider } from './auto-login-provider';
import { MobileGpsDeviceProvider } from './mobile-gps-device-provider';
import { MobileSessionKeyStore } from './MobileSessionKeyStore';

/**
 * Signs the device in with its own generated credentials (USER_SESSION_CONSTS.AUTO_LOGIN_MODE):
 * there is no form. On success the session is saved and the session check is re-run, exactly as
 * the manual sign-in does; on failure the error is shown with a retry.
 */
export function AutoLoginPage(props: { reloadSessionFunc?: () => void }) {
  const [login] = useLoginMutation();
  const [error, setError] = useState<string | undefined>();
  // Guards against a second login while one is running (React StrictMode runs the mount effect
  // twice in dev, and a double login would spend the server's rotation state twice).
  const running = useRef(false);

  const runAutoLogin = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setError(undefined);
    try {
      const sessionInfo = await AutoLoginProvider.GetAutoLoginInfo();
      const values = {
        UserName: sessionInfo.AutoUserName,
        Password: sessionInfo.AutoPassword,
      } as LoginRequestData;
      values.GpsDeviceSerial = await MobileGpsDeviceProvider.GetDeviceSerialNumber();
      await ClientSideInfoProvider.CheckInfoCollected();
      values.ClientSideInfo = ClientSideInfoProvider.Info;

      const res = await login(values).unwrap();
      if (!(res.SessionKey && res.SessionSign && res.RotationCounter !== undefined)) {
        // Reloading without a saved session would just come back here: stop and let the user retry.
        throw new Error('The server did not return a session');
      }
      sessionInfo.SessionKey = res.SessionKey;
      await MobileSessionKeyStore.GetInstance().SaveAutoSessionData(
        sessionInfo,
        res.SessionSign,
        res.RotationCounter
      );
      // Re-runs the session check, which stores the token and swaps in the app UI.
      props.reloadSessionFunc?.();
    } catch (e) {
      console.warn('[auto-login] failed', e);
      setError(getErrorMessage(e, 'Automatic sign-in failed'));
    } finally {
      running.current = false;
    }
  }, [login, props.reloadSessionFunc]);

  useEffect(() => {
    void runAutoLogin();
    // Once on mount; later attempts come from the retry button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error !== undefined) {
    return <InitError title="Automatic sign-in failed" errorMsg={error} retryFunc={() => void runAutoLogin()} />;
  }
  return <InitWaiter loadingLabel="Creating user session..." />;
}
