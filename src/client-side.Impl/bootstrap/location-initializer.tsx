import { useEffect, useState } from 'react';
import { LocationProvider } from '@/app.Commons/services/location/location-provider';
import { LocationService } from '@/app.Commons/services/location/locationService';
import { InitWaiter } from './init-waiter';

import { getErrorMessage } from '@/client-side.Commons/dataLayer/core/apiError';
import { useGetOnceMyUserPrivacyMode } from '@/client-side.Commons/dataLayer/api/user/myUserLocationPrivacyApi';
import { useGetOnceMyUser } from '@/client-side.Commons/dataLayer/api/user/myUserApi';
import { InitError } from '@/client-side.Impl/bootstrap/init-error';
import { LocationReportEnabledManager } from '@/client-side.Impl/services/location-report-enabler';

// App-specific wrapper around the reusable LocationProvider base: LocationProvider only does
// the BackgroundGeolocation wiring and never blocks rendering, so this is where an app decides
// what "ready" means for its own startup flow and what to show while waiting for it.
export function LocationInitializer(props: { children: React.ReactNode }) {
    const [isLocationInitialized, setIsLocationInitialized] = useState(false);
    const { data: isPrivate, error: privacyError, isLoading: isPrivacyLoading, isFetching: isPrivacyFetching, isSuccess: isPrivacyLoaded, refetch: refetchPrivacy } = useGetOnceMyUserPrivacyMode();
    const { data: myUser, error: myUserError, isLoading: isMyUserLoading, isFetching: isMyUserFetching, isSuccess: isMyUserLoaded, refetch: refetchMyUser } = useGetOnceMyUser();

    console.log(`[LocationInitializer] isPrivacyLoading=${isPrivacyLoading}, isMyUserLoading=${isMyUserLoading}, isPrivacyLoaded=${isPrivacyLoaded}, isMyUserLoaded=${isMyUserLoaded}, privacyError=${privacyError && getErrorMessage(privacyError)}, myUserError=${myUserError && getErrorMessage(myUserError)}, isPrivate=${isPrivate}`, myUser);

    useEffect(() => {
        if (isPrivacyLoaded && isMyUserLoaded) {
            LocationReportEnabledManager.Init(isPrivate, myUser?.CompanyId != undefined);
            LocationService.GetInstance().InitLocationReportState(LocationReportEnabledManager.GetInstance().ShouldReportLocation());
            const locationProviderInstance = new LocationProvider();
            locationProviderInstance.Init(LocationReportEnabledManager.GetInstance().ShouldReportLocation()).then(() => {
                setIsLocationInitialized(true);
            });
            return () => {
                locationProviderInstance.Destroy();
            }
        }
    }, [isPrivacyLoaded, isMyUserLoaded]);

    // RTK keeps the previous error while a refetch is in flight, so only show it once the retry has settled.
    const myUserFailed = !!myUserError && !isMyUserFetching;
    const privacyFailed = !!privacyError && !isPrivacyFetching;
    // Once-hooks stop their query after the first success, so only the failed one can be refetched.
    const retry = () => {
        if (myUserFailed) refetchMyUser();
        if (privacyFailed) refetchPrivacy();
    };
    const errorMsg = myUserFailed ? getErrorMessage(myUserError) : privacyFailed ? getErrorMessage(privacyError) : null;

    return (
        <>
            {errorMsg ? (
                <InitError errorMsg={errorMsg} retryFunc={retry} />
            ) : !isLocationInitialized ? (
                <InitWaiter loadingLabel="Starting location report..." />
            ) : (
                props.children
            )}
        </>
    );
}
