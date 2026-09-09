import { useEffect, useState } from 'react';
import { LocationProvider } from '@/app.Commons/services/location/location-provider';
import { LocationService } from '@/app.Commons/services/location/locationService';
import { InitWaiter } from '../../app.Impl/initComponents/init-waiter';
import { useLoadActiveTeamId, useLoadUserLocationPrivacy } from '@/app.Commons/dataLayer/api/myUserApi';

// App-specific wrapper around the reusable LocationProvider base: LocationProvider only does
// the BackgroundGeolocation wiring and never blocks rendering, so this is where an app decides
// what "ready" means for its own startup flow and what to show while waiting for it.
export function LocationInitializer(props: { children: React.ReactNode }) {
    const [isLocationInitialized, setIsLocationInitialized] = useState(false);
    const [isLocationStarted, setIsLocationStarted] = useState(false);
    const [loadUserPrivacy, { data: userPrivacy, error: privacyError, isLoading: isPrivacyLoading, isSuccess: isPrivacyLoaded }] = useLoadUserLocationPrivacy();
    const [loadActiveTeamId, { data: activeTeamId, error: teamIdError, isLoading: isTeamIdLoading, isSuccess: isTeamIdLoaded }] = useLoadActiveTeamId();

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
        if (!isPrivacyLoaded || !isTeamIdLoaded) return;
        if (activeTeamId) {
            LocationService.SetBothPrivateMode_ReportLocationMode(((userPrivacy?.PrivacyMode) ?? 0) > 0, true);
        }
        else {
            LocationService.SetPrivateMode(((userPrivacy?.PrivacyMode) ?? 0) > 0);
        }
        setIsLocationInitialized(true);
    }, [isLocationStarted, userPrivacy, activeTeamId, privacyError, teamIdError, isPrivacyLoading, isTeamIdLoading, isPrivacyLoaded, isTeamIdLoaded]);

    return (
        <LocationProvider setIsLocationStarted={setIsLocationStarted}>
            {isLocationInitialized ? props.children : <InitWaiter loadingLabel="Starting location report..." />}
        </LocationProvider>
    );
}
