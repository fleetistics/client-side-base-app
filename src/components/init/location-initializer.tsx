import { useEffect, useRef, useState } from 'react';
import { LocationProvider } from '@/app.Commons/services/location/location-provider';
import { LocationService } from '@/app.Commons/services/location/locationService';
import { InitWaiter } from '../../app.Impl/initComponents/init-waiter';
import { useCachedPrivacyMode, useLoadActiveTeamId, useLoadUserLocationPrivacy, usePendingPrivacyMode } from '@/app.Commons/dataLayer/api/user/myUserApi';
import { useOutboxHydrated } from '@/client-side.Commons/dataLayer/outbox/outboxHooks';

// App-specific wrapper around the reusable LocationProvider base: LocationProvider only does
// the BackgroundGeolocation wiring and never blocks rendering, so this is where an app decides
// what "ready" means for its own startup flow and what to show while waiting for it.
export function LocationInitializer(props: { children: React.ReactNode }) {
    const [isLocationInitialized, setIsLocationInitialized] = useState(false);
    const [isLocationStarted, setIsLocationStarted] = useState(false);
    const [loadUserPrivacy, { data: userPrivacy, error: privacyError, isLoading: isPrivacyLoading, isSuccess: isPrivacyLoaded }] = useLoadUserLocationPrivacy();
    const [loadActiveTeamId, { data: activeTeamId, error: teamIdError, isLoading: isTeamIdLoading, isSuccess: isTeamIdLoaded }] = useLoadActiveTeamId();
    // Privacy is offline-first: a choice the server hasn't confirmed yet (queued before an
    // app restart, say) must win over the server's older value, or the app would start
    // reporting location for a user who went private offline. The cache already has pending
    // changes applied; the pending value covers the case where it isn't loaded.
    const isOutboxHydrated = useOutboxHydrated();
    const pendingPrivacyMode = usePendingPrivacyMode();
    const cachedPrivacyMode = useCachedPrivacyMode();
    const isPrivate = pendingPrivacyMode ?? cachedPrivacyMode ?? (((userPrivacy?.PrivacyMode) ?? 0) > 0);
    // Read through a ref: this effect applies the startup value only (plus a re-apply once location
    // has started). Later switches go through useSwitchUserPrivacyMode, which sets LocationService
    // itself - re-running on them would also re-assert report mode below.
    const isPrivateRef = useRef(isPrivate);
    isPrivateRef.current = isPrivate;

    console.log(`[LocationInitializer] isLocationStarted=${isLocationStarted}, isPrivacyLoading=${isPrivacyLoading}, isTeamIdLoading=${isTeamIdLoading}, isPrivacyLoaded=${isPrivacyLoaded}, isTeamIdLoaded=${isTeamIdLoaded}, privacyError=${privacyError}, teamIdError=${teamIdError}, userPrivacy=${JSON.stringify(userPrivacy)}, activeTeamId=${activeTeamId}`);
    useEffect(() => {
        loadUserPrivacy();
        loadActiveTeamId();
    }, [loadUserPrivacy, loadActiveTeamId]);

    useEffect(() => {
        if (isPrivacyLoading || isTeamIdLoading) return;
        if (privacyError || teamIdError) {
            // Can't tell whether sharing should be on, but don't block startup on a fetch failure.
            console.warn('[LocationInitializer] failed to load location privacy/team info', privacyError ?? teamIdError);
            setIsLocationInitialized(true);
            return;
        }
        if (!isPrivacyLoaded || !isTeamIdLoaded || !isOutboxHydrated) return;
        if (activeTeamId) {
            LocationService.SetBothPrivateMode_ReportLocationMode(isPrivateRef.current, true);
        }
        else {
            LocationService.SetPrivateMode(isPrivateRef.current);
        }
        setIsLocationInitialized(true);
    }, [isLocationStarted, activeTeamId, privacyError, teamIdError, isPrivacyLoading, isTeamIdLoading, isPrivacyLoaded, isTeamIdLoaded, isOutboxHydrated]);

    return (
        <LocationProvider setIsLocationStarted={setIsLocationStarted}>
            {isLocationInitialized ? props.children : <InitWaiter loadingLabel="Starting location report..." />}
        </LocationProvider>
    );
}
