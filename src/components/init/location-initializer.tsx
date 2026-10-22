import { useEffect, useState } from 'react';
import { LocationProvider } from '@/app.Commons/services/location/location-provider';
import { LocationService } from '@/app.Commons/services/location/locationService';
import { InitWaiter } from '../../client-side.Impl/bootstrap/init-waiter';

import { useLoadActiveTeamId } from '@/client-side.Commons/dataLayer/api/team/teamApi';
import { useGetOnceMyUserPrivacyMode } from '@/client-side.Commons/dataLayer/api/user/myUserLocationPrivacyApi';

// App-specific wrapper around the reusable LocationProvider base: LocationProvider only does
// the BackgroundGeolocation wiring and never blocks rendering, so this is where an app decides
// what "ready" means for its own startup flow and what to show while waiting for it.
export function LocationInitializer(props: { children: React.ReactNode }) {
    const [isLocationInitialized, setIsLocationInitialized] = useState(false);
    const [isLocationStarted, setIsLocationStarted] = useState(false);
    // Privacy is offline-first: a choice the server hasn't confirmed yet (queued before an
    // app restart, say) must win over the server's older value, or the app would start
    // reporting location for a user who went private offline. useGetOnceUserPrivacyMode waits
    // for the outbox to hydrate, then holds the startup value - later switches go through
    // usePatchUserLocationPrivacy, which sets LocationService itself.
    const { data: isPrivate, error: privacyError, isLoading: isPrivacyLoading, isSuccess: isPrivacyLoaded } = useGetOnceMyUserPrivacyMode();
    const [loadActiveTeamId, { data: activeTeamId, error: teamIdError, isLoading: isTeamIdLoading, isSuccess: isTeamIdLoaded }] = useLoadActiveTeamId();

    console.log(`[LocationInitializer] isLocationStarted=${isLocationStarted}, isPrivacyLoading=${isPrivacyLoading}, isTeamIdLoading=${isTeamIdLoading}, isPrivacyLoaded=${isPrivacyLoaded}, isTeamIdLoaded=${isTeamIdLoaded}, privacyError=${privacyError}, teamIdError=${teamIdError}, isPrivate=${isPrivate}, activeTeamId=${activeTeamId}`);
    useEffect(() => {
        loadActiveTeamId();
    }, [loadActiveTeamId]);

    useEffect(() => {
        if (isPrivacyLoading || isTeamIdLoading) return;
        if (privacyError || teamIdError) {
            // Can't tell whether sharing should be on, but don't block startup on a fetch failure.
            console.warn('[LocationInitializer] failed to load location privacy/team info', privacyError ?? teamIdError);
            setIsLocationInitialized(true);
            return;
        }
        if (!isPrivacyLoaded || !isTeamIdLoaded) return;
        if (activeTeamId) {
            LocationService.SetBothPrivateMode_ReportLocationMode(isPrivate, true);
        }
        else {
            LocationService.SetPrivateMode(isPrivate);
        }
        setIsLocationInitialized(true);
    }, [isLocationStarted, activeTeamId, isPrivate, privacyError, teamIdError, isPrivacyLoading, isTeamIdLoading, isPrivacyLoaded, isTeamIdLoaded]);

    return (
        <LocationProvider setIsLocationStarted={setIsLocationStarted}>
            {isLocationInitialized ? props.children : <InitWaiter loadingLabel="Starting location report..." />}
        </LocationProvider>
    );
}
