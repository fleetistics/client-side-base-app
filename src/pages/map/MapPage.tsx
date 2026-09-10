import { useRef, useState } from 'react';
import { View } from 'react-native';
import MapView, { MapMarker, MapType, Region } from 'react-native-maps';
import { useColorScheme } from '@/uiColorScheme/useColorScheme';
import { NAV_THEME } from '@/uiColorScheme/constants';
import { mapDarkModeStyle } from '@/uiColorScheme/dark-map-style';
import { useLatestGPSLocation } from '@/app.Commons/dataLayer/api/locationApi';
import { useGetStringAppSettings } from '@/client-side.Commons/dataLayer/api/appSettingsApi';
import { AppCommonUserSettingsEnum } from '@/app.Commons/configs/app-user-settings-enums';
import { MapUtils } from '@/app.Commons/helpers/map-utils';
import { useGetMyUser, useGetMyUserQuery, useGetUserPrivacyMode, useSwitchUserPrivacyMode } from '@/app.Commons/dataLayer/api/myUserApi';
import { UserMapMarker } from '@/app.Commons/components/map/user-map-marker';
import { UserMapMarkerPopupInfo } from '@/app.Commons/components/map/marker-popup-info';
import { Button } from '@/app.Commons/components/controls/button';
import { Text } from '@/app.Commons/components/controls/text';
import { isE2EMode, E2E_MOCK_LOCATION } from '@/app.Impl/testSupport/e2e-mode';


export function MapPage() {
    const { colorScheme, isDarkColorScheme } = useColorScheme();
    const latestLocation = useLatestGPSLocation();
    const { data: myUserData } = useGetMyUser();
    const mapRef = useRef<MapView>(null);
    const markerRefs = useRef<Map<number, MapMarker>>(new Map());
    const [selectedUserMapMarker, setSelectedUserMapMarker] = useState<UserMapMarkerPopupInfo | null>(null);
    const regionChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isMarkerLabelVisible, setIsMarkerLabelVisible] = useState(true);
    const [showMarkerTriangle, setShowMarkerTriangle] = useState(false);
    const [showMarkerAlert, setShowMarkerAlert] = useState(false);
    const [showsMyLocationButton, setShowsMyLocationButton] = useState(true);
    const [isMapReady, setIsMapReady] = useState(false);
    const [mapZoomedState, setMapZoomedState] = useState(false);
    const mapType = useGetStringAppSettings(AppCommonUserSettingsEnum.mapType, 'hybrid').data as MapType;
    const mapZoomedType = useGetStringAppSettings(AppCommonUserSettingsEnum.mapZoomedType, 'satellite').data as MapType;

      const { data: isPrivacyModeOn } = useGetUserPrivacyMode();
      const [switchPrivacyMode] = useSwitchUserPrivacyMode();
    
    return (
        <View className="flex-1 bg-background">
            <Button
                testID="toggle-privacy"
                className="absolute top-4 right-4 z-10"
                variant={isPrivacyModeOn ? 'destructive' : 'secondary'}
                onPress={() => switchPrivacyMode(!isPrivacyModeOn)}
            >
                <Text>{isPrivacyModeOn ? 'Privacy: On' : 'Privacy: Off'}</Text>
            </Button>
            <Button
                testID="toggle-triangle"
                className="absolute top-16 right-4 z-10"
                variant={showMarkerTriangle ? 'destructive' : 'secondary'}
                onPress={() => setShowMarkerTriangle((prev) => !prev)}
            >
                <Text>{showMarkerTriangle ? 'Triangle: On' : 'Triangle: Off'}</Text>
            </Button>
            <Button
                testID="toggle-alert"
                className="absolute top-28 right-4 z-10"
                variant={showMarkerAlert ? 'destructive' : 'secondary'}
                onPress={() => setShowMarkerAlert((prev) => !prev)}
            >
                <Text>{showMarkerAlert ? 'Alert: On' : 'Alert: Off'}</Text>
            </Button>
            <Button
                testID="toggle-label"
                className="absolute top-40 right-4 z-10"
                variant={isMarkerLabelVisible ? 'destructive' : 'secondary'}
                onPress={() => setIsMarkerLabelVisible((prev) => !prev)}
            >
                <Text>{isMarkerLabelVisible ? 'Label: On' : 'Label: Off'}</Text>
            </Button>
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                userInterfaceStyle={isDarkColorScheme ? 'dark' : 'light'}
                customMapStyle={isDarkColorScheme ? mapDarkModeStyle : []}
                    showsMyLocationButton={showsMyLocationButton}
                    onMapReady={() => { setShowsMyLocationButton(false); setIsMapReady(true); }}
                    toolbarEnabled={false}
                    moveOnMarkerPress={false}
                    showsCompass={false}
                    showsUserLocation={false}
                    followsUserLocation={false}
                    // "none" is meant to drop all base tiles on Android for deterministic Detox
                    // screenshot diffs, but in practice the Google Maps SDK's newer map renderer
                    // still loads real tiles underneath regardless (a known upstream limitation,
                    // confirmed via logcat: the "none" prop value is what's actually being passed
                    // on every render) — kept anyway since it's harmless and may start working on
                    // a renderer/SDK version where it isn't broken. e2e/mapMarkerRedraw.test.ts
                    // works around this by settling long enough for real tile loads to finish
                    // rather than depending on the background being static.
                    mapType={isE2EMode() ? 'none' : (mapZoomedState ? mapZoomedType : mapType)}
                    initialRegion={isE2EMode() ? {
                        latitude: E2E_MOCK_LOCATION.Lat, longitude: E2E_MOCK_LOCATION.Lng,
                        latitudeDelta: 0.01, longitudeDelta: 0.01,
                    } : undefined}

                    rotateEnabled={true}
                    pitchEnabled={false}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    loadingEnabled={true}

                loadingIndicatorColor={NAV_THEME[colorScheme].colors.primary}
                loadingBackgroundColor={NAV_THEME[colorScheme].colors.background}
                onRegionChange={(reg: Region) => {
                        if (regionChangeTimer.current) clearTimeout(regionChangeTimer.current);
                        regionChangeTimer.current = setTimeout(() => {
                            try {
                                if (colorScheme != 'dark' && (reg.latitudeDelta < MapUtils.MaxLatitudeDeltaForType) != mapZoomedState) {
                                    setMapZoomedState(reg.latitudeDelta < MapUtils.MaxLatitudeDeltaForType);
                                }
                                // mapData.setMapBounds(
                                //     reg.latitude + (reg.latitudeDelta / 2),
                                //     reg.longitude + (reg.longitudeDelta / 2),
                                //     reg.latitude - (reg.latitudeDelta / 2),
                                //     reg.longitude - (reg.longitudeDelta / 2)
                                // );
                            } catch (error) {
                                console.error('Error in onRegionChange:', error);
                            }
                        }, 300);
                }}
            >
                    {!isPrivacyModeOn && latestLocation?.Lat != null && latestLocation?.Lng != null && (
                        <UserMapMarker
                            key={myUserData?.Id}
                            ref={(ref) => {
                                const id = myUserData?.Id;
                                if (id != null) {
                                    if (ref) markerRefs.current.set(id, ref);
                                    else markerRefs.current.delete(id);
                                }
                            }}
                            color={"green"}
                            lat={latestLocation.Lat}
                            lng={latestLocation.Lng}
                            showLabel={isMarkerLabelVisible}
                            label="You"
                            showTriangle={showMarkerTriangle}
                            showAlert={showMarkerAlert}
                            onPress={() => setSelectedUserMapMarker({
                                lat: latestLocation.Lat,
                                lng: latestLocation.Lng,
                                userId: myUserData?.Id,
                                isMyUser: true,
                                reducedInfo: true
                            })}
                        />
                    )}
                </MapView>
            {/* react-native-maps renders Marker children into an off-screen native snapshot
                target that Espresso/Detox element matchers can't traverse, so a testID inside
                UserMapMarker itself is unreachable from e2e tests. This plain sibling view gives
                Detox something real to wait on for "map + marker have rendered". */}
            {isE2EMode() && isMapReady && !isPrivacyModeOn && latestLocation?.Lat != null && (
                <View testID="map-marker-ready" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
            )}
        </View>
    );
}
