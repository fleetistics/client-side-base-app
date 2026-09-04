import { useRef, useState } from 'react';
import { View } from 'react-native';
import MapView, { MapType, Region } from 'react-native-maps';
import { useColorScheme } from '@/lib/useColorScheme';
import { NAV_THEME } from '@/lib/constants';
import { mapDarkModeStyle } from '@/uiLayout/dark-map-style';

const MAP_TYPE: MapType = 'hybrid';
const MAP_ZOOMED_TYPE: MapType = 'satellite';

// Below this latitudeDelta the map is considered "zoomed in" and switches to MAP_ZOOMED_TYPE.
const MAX_LATITUDE_DELTA_FOR_TYPE = 0.007;

export function MapPage() {
    const { colorScheme, isDarkColorScheme } = useColorScheme();

    const mapRef = useRef<MapView>(null);
    const regionChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [showsMyLocationButton, setShowsMyLocationButton] = useState(true);
    const [isMapReady, setIsMapReady] = useState(false);
    const [mapZoomedState, setMapZoomedState] = useState(false);

    return (
        <View className="flex-1 bg-background">
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                userInterfaceStyle={isDarkColorScheme ? 'dark' : 'light'}
                customMapStyle={isDarkColorScheme ? mapDarkModeStyle : []}
                mapType={mapZoomedState ? MAP_ZOOMED_TYPE : MAP_TYPE}
                showsUserLocation
                showsMyLocationButton={showsMyLocationButton}
                onMapReady={() => { setShowsMyLocationButton(false); setIsMapReady(true); }}
                toolbarEnabled={false}
                showsCompass={false}
                loadingEnabled
                loadingIndicatorColor={NAV_THEME[colorScheme].colors.primary}
                loadingBackgroundColor={NAV_THEME[colorScheme].colors.background}
                onRegionChange={(reg: Region) => {
                    if (regionChangeTimer.current) clearTimeout(regionChangeTimer.current);
                    regionChangeTimer.current = setTimeout(() => {
                        const zoomedIn = reg.latitudeDelta < MAX_LATITUDE_DELTA_FOR_TYPE;
                        if (!isDarkColorScheme && zoomedIn !== mapZoomedState) {
                            setMapZoomedState(zoomedIn);
                        }
                    }, 300);
                }}
            />
        </View>
    );
}
